import { alpha, Box, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashedGraph } from 'src/components/common';
import {
  IDebt,
  IFinancialPlan,
  IFinancialSnapshot,
  IFixedExpense,
  IIncome,
} from 'src/models/finances';
import { SeriesValueFormatter } from '@mui/x-charts/internals';
import dayjs from 'dayjs';

interface IDebtWithExtraPayment extends IDebt {
  extraPayment: number;
}

function applyAvalancheMethod(
  debts: IDebt[],
  remaining: number
): IDebtWithExtraPayment[] {
  // Ordenar las deudas por el interés anual más alto primero
  const sortedDebts = debts.sort((a, b) => b.annualInterest - a.annualInterest);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const payment = Math.min(
      debt.minimumPayment + remaining,
      debt.pendingDebt + interest
    );

    const extraPayment = Math.max(payment - debt.minimumPayment, 0);
    remaining -= extraPayment;

    return {
      ...debt,
      pendingDebt: debt.pendingDebt + interest - payment,
      extraPayment,
    };
  });
}

function applySnowballMethod(
  debts: IDebt[],
  remaining: number
): IDebtWithExtraPayment[] {
  // Ordenar las deudas por el saldo pendiente más bajo primero
  const sortedDebts = debts.sort((a, b) => a.pendingDebt - b.pendingDebt);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;
    const payment = Math.min(
      debt.minimumPayment + remaining,
      debt.pendingDebt + interest
    );

    const extraPayment = Math.max(payment - debt.minimumPayment, 0);
    remaining -= extraPayment;

    return {
      ...debt,
      pendingDebt: debt.pendingDebt + interest - payment,
      extraPayment,
    };
  });
}

function generatePredictions(
  historicalSnapshots: IFinancialSnapshot[],
  fixedExpenses: IFixedExpense[],
  incomes: IIncome[],
  method = 'avalanche'
): IFinancialSnapshot[] {
  const snapshots = [...historicalSnapshots];

  for (let i = historicalSnapshots.length; i < 12; i++) {
    const previousSnapshot = snapshots[i - 1];

    const totalIncome = incomes.reduce((sum, income) => {
      switch (income.period) {
        case 'weekly':
          return sum + income.amount * 4; // Aproximando semanas por mes
        case 'monthly':
          return sum + income.amount;
        case 'yearly':
          return sum + income.amount / 12;
        case 'single':
          return dayjs(income.singleDate).month() ===
            previousSnapshot.date.month() &&
            dayjs(income.singleDate).year() === previousSnapshot.date.year()
            ? sum + income.amount
            : sum;
      }
    }, 0);

    const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => {
      switch (expense.expenseType) {
        case 'single':
          return dayjs(expense.singleDate).month() ===
            previousSnapshot.date.month() &&
            dayjs(expense.singleDate).year() === previousSnapshot.date.year()
            ? sum + expense.amount
            : sum;
        case 'primary':
          return sum + expense.amount;
        case 'secondary':
          return sum + expense.amount;
      }
    }, 0);

    const totalMinimumPayments = previousSnapshot.debts.reduce(
      (sum, debt) => sum + debt.minimumPayment,
      0
    );

    // Restamos tanto los gastos fijos como los pagos mínimos de las deudas del total de ingresos
    const remaining = totalIncome - totalFixedExpenses - totalMinimumPayments;

    let newDebts: IDebtWithExtraPayment[];
    if (method === 'avalanche') {
      newDebts = applyAvalancheMethod(previousSnapshot.debts, remaining);
    } else {
      newDebts = applySnowballMethod(previousSnapshot.debts, remaining);
    }

    snapshots.push({
      reviewed: false,
      debts: newDebts.map(({ extraPayment, ...debt }) => debt),
      date: previousSnapshot.date.add(1, 'month'),
    });
  }

  return snapshots;
}

function generateMissingHistoricalSnapshots(
  snapshots: IFinancialSnapshot[]
): IFinancialSnapshot[] {
  const historicalSnapshots = [...snapshots];

  if (snapshots.length < 4) {
    const firstSnapshot = snapshots[0];
    for (let i = snapshots.length; i < 4; i++) {
      const newDate = firstSnapshot.date.subtract(
        i - snapshots.length + 1,
        'month'
      );
      historicalSnapshots.unshift({
        ...firstSnapshot,
        date: newDate,
      });
    }
  }

  return historicalSnapshots;
}

function getColorForPlan(index: number, total: number, baseColor: string) {
  if (index === 0) {
    return alpha(baseColor, 1);
  }

  const minOpacity = 0.2;
  const maxOpacity = 0.6;

  const step = (maxOpacity - minOpacity) / (total - 1);
  const opacity = maxOpacity - (index - 1) * step;

  return alpha(baseColor, opacity);
}

interface Props {
  financialPlans: IFinancialPlan[];
  loading: boolean;
}

const PersonalFinancesGraph = ({ financialPlans, loading }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const _financialPlans = useMemo(
    () =>
      financialPlans.map((plan) => {
        const snapshots = generatePredictions(
          generateMissingHistoricalSnapshots(plan.financialSnapshots),
          plan.fixedExpenses,
          plan.incomes
        );
        return { ...plan, financialSnapshots: snapshots };
      }),
    [financialPlans]
  );

  const datasets = useMemo(
    () =>
      _financialPlans.map((plan, index) => {
        const debtsTotal = plan.financialSnapshots.map((snapshot) =>
          snapshot.debts.reduce((sum, debt) => sum + debt.pendingDebt, 0)
        );

        return {
          data: debtsTotal,
          label: plan.name,
          color: getColorForPlan(
            index,
            _financialPlans.length,
            theme.palette.error.main
          ),
          valueFormatter: (value: number) => `$${value.toFixed(2)}`,
        } as {
          data: number[];
          label: string;
          color: string;
          valueFormatter: SeriesValueFormatter<number | null> | undefined;
        };
      }),
    [_financialPlans, theme]
  );

  return (
    <Box width={'100%'} height={500}>
      <LineChart
        loading={loading}
        series={datasets}
        xAxis={[
          {
            data: _financialPlans.length
              ? _financialPlans[0].financialSnapshots.map((_, i) => i)
              : [],
            label: t('finances.personalFinances.graph.month'),
            scaleType: 'point',
            valueFormatter: (value) =>
              _financialPlans[0].financialSnapshots[value].date.format('MMM'),
          },
        ]}
        yAxis={[
          {
            scaleType: 'linear',
            valueFormatter: (value) => `$${value}`,
          },
        ]}
        slots={{ line: DashedGraph }}
        slotProps={{
          line: { limit: 3, sxAfter: { strokeDasharray: '5 5' } } as any,
        }}
      />
      <Box mt={2}>
        <Typography variant="body1">Some information</Typography>
      </Box>
    </Box>
  );
};

export default PersonalFinancesGraph;
