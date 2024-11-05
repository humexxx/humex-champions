import { useMemo } from 'react';

import { alpha, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { SeriesValueFormatter } from '@mui/x-charts/internals';
import { AVG_WEEKS_IN_MONTH } from '@shared/consts';
import {
  IDebt,
  IFinancialPlan,
  IFinancialSnapshot,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DashedGraph } from 'src/components';

const NUMBER_OF_MONTHS_PAST_TO_SHOW = 2;
const NUMBER_OF_MONTHS_FUTURE_TO_SHOW = {
  sm: 6,
  md: 9,
  lg: 12,
};

interface IDebtWithExtraPayment extends IDebt {
  extraPayment: number;
}

function applyAvalancheMethod(
  debts: IDebt[],
  surplus: number
): IDebtWithExtraPayment[] {
  // Ordenar las deudas por el interés anual más alto primero
  const sortedDebts = debts.sort((a, b) => b.annualInterest - a.annualInterest);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;

    const payment =
      surplus >= 0
        ? Math.min(debt.minimumPayment + surplus, debt.pendingDebt + interest)
        : debt.minimumPayment;

    const extraPayment = Math.max(payment - debt.minimumPayment, 0);
    surplus -= extraPayment;

    return {
      ...debt,
      pendingDebt: debt.pendingDebt + interest - payment,
      extraPayment,
    };
  });
}

function applySnowballMethod(
  debts: IDebt[],
  surplus: number
): IDebtWithExtraPayment[] {
  // Ordenar las deudas por el saldo pendiente más bajo primero
  const sortedDebts = debts.sort((a, b) => a.pendingDebt - b.pendingDebt);

  return sortedDebts.map((debt) => {
    const interest = (debt.pendingDebt * debt.annualInterest) / 12 / 100;

    const payment =
      surplus >= 0
        ? Math.min(debt.minimumPayment + surplus, debt.pendingDebt + interest)
        : debt.minimumPayment;

    const extraPayment = Math.max(payment - debt.minimumPayment, 0);
    surplus -= extraPayment;

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
  viewSize: 'sm' | 'md' | 'lg',
  method = 'avalanche'
): IFinancialSnapshot[] {
  const snapshots = [...historicalSnapshots];
  let deficitCarryover = 0;

  for (
    let i = historicalSnapshots.length;
    i <
    NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize] + NUMBER_OF_MONTHS_PAST_TO_SHOW;
    i++
  ) {
    const previousSnapshot = snapshots[i - 1];

    const totalIncome = incomes.reduce((sum, income) => {
      switch (income.period) {
        case 'weekly':
          return sum + income.amount * AVG_WEEKS_IN_MONTH;
        case 'monthly':
          return sum + income.amount;
        case 'yearly':
          return dayjs(income.date).month() === previousSnapshot.date.month()
            ? sum + income.amount
            : sum;
        case 'single':
          return dayjs(income.date).month() === previousSnapshot.date.month() &&
            dayjs(income.date).year() === previousSnapshot.date.year()
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
    let surplus =
      totalIncome -
      totalFixedExpenses -
      totalMinimumPayments +
      deficitCarryover;

    let newDebts: IDebtWithExtraPayment[];
    if (method === 'avalanche') {
      newDebts = applyAvalancheMethod(previousSnapshot.debts, surplus);
    } else {
      newDebts = applySnowballMethod(previousSnapshot.debts, surplus);
    }

    const totalBalanceInFavorForDebts = newDebts.reduce(
      (sum, debt) => (debt.pendingDebt < 0 ? sum + debt.pendingDebt : sum),
      0
    );

    surplus += totalBalanceInFavorForDebts * -1;
    deficitCarryover = surplus < 0 ? surplus : 0;

    // Logs for debugging
    // console.log(
    //   'Iteration',
    //   previousSnapshot.date.add(1, 'month').format('MMM-YYYY')
    // );
    // console.log('Total Income', totalIncome);
    // console.log('Total Fixed Expenses', totalFixedExpenses);
    // console.log('Total Minimum Payments', totalMinimumPayments);
    // console.log('Surplus', surplus);
    // console.log('Deficit Carryover', deficitCarryover);
    // console.log(
    //   'Total Balance in Favor for Debts',
    //   totalBalanceInFavorForDebts
    // );
    // console.log('New Debts', newDebts);
    // console.log('----------------------');

    snapshots.push({
      reviewed: false,
      debts: newDebts
        .filter((x) => x.pendingDebt > 0)
        .map(({ extraPayment, ...debt }) => debt),
      date: previousSnapshot.date.add(1, 'month'),
      surplus,
    });
  }

  return snapshots;
}

function generateMissingHistoricalSnapshots(
  snapshots: IFinancialSnapshot[]
): IFinancialSnapshot[] {
  const historicalSnapshots = [...snapshots];

  if (snapshots.length < NUMBER_OF_MONTHS_PAST_TO_SHOW + 1) {
    const firstSnapshot = snapshots[0];
    for (let i = snapshots.length; i < NUMBER_OF_MONTHS_PAST_TO_SHOW + 1; i++) {
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

  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const viewSize = isLg ? 'lg' : isMd ? 'md' : 'sm';

  const _financialPlans = useMemo(
    () =>
      financialPlans.map((plan) => {
        const snapshots = generatePredictions(
          generateMissingHistoricalSnapshots(plan.financialSnapshots),
          plan.fixedExpenses,
          plan.incomes,
          viewSize
        );
        return { ...plan, financialSnapshots: snapshots };
      }),
    [financialPlans, viewSize]
  );

  const datasets = useMemo(
    () =>
      _financialPlans.map((plan, index) => {
        const debtsTotal = plan.financialSnapshots.map(
          (snapshot) =>
            snapshot.debts.reduce((sum, debt) => sum + debt.pendingDebt, 0) +
            (snapshot.surplus < 0 ? snapshot.surplus * -1 : 0)
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

  console.log(datasets);

  return (
    <Box width={'100%'} height={500}>
      <LineChart
        grid={{ vertical: true, horizontal: true }}
        loading={loading}
        dataset={datasets}
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
          line: {
            limit: NUMBER_OF_MONTHS_PAST_TO_SHOW,
            sxAfter: { strokeDasharray: '5 5' },
          } as any,
        }}
      />
    </Box>
  );
};

export default PersonalFinancesGraph;
