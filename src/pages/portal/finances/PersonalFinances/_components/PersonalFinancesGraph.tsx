import { useMemo } from 'react';

import { alpha, Box, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { IFinancialPlan } from '@shared/models/finances';
import dayjs from 'dayjs';
import { formatCompactNumber, normalizeObjectDates, toDayjs } from 'src/utils';
import { financeUtils } from '@shared/utils';
import { CustomAnimatedLine } from 'src/components/graphs';
import { SYSTEM } from 'src/consts';
import { EPayoffMethodType } from '@shared/enums/finance';

const NUMBER_OF_MONTHS_FUTURE_TO_SHOW = {
  sm: 6,
  md: 9,
  lg: 12,
};

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
  currentIndex: number;
}

const PersonalFinancesGraph = ({
  financialPlans,
  loading,
  currentIndex,
}: Props) => {
  const theme = useTheme();

  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const viewSize = isLg ? 'lg' : isMd ? 'md' : 'sm';

  const _clonedFinancialPlans = useMemo(() => {
    return normalizeObjectDates<IFinancialPlan[]>(
      structuredClone(financialPlans),
      toDayjs
    );
  }, [financialPlans]);

  const _avalancheFinancialPlan = useMemo(() => {
    const plan = _clonedFinancialPlans[currentIndex];

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        plan.financialSnapshots.at(-1)!,
        EPayoffMethodType.AVALANCHE,
        NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
      );

    return {
      ...plan,
      name: `${SYSTEM}_AVALANCHE`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlans, currentIndex]);

  const _snowballFinancialPlan = useMemo(() => {
    const plan = _clonedFinancialPlans[currentIndex];

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        plan.financialSnapshots.at(-1)!,
        EPayoffMethodType.SNOWBALL,
        NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
      );

    return {
      ...plan,
      name: `${SYSTEM}_SNOWBALL`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlans, currentIndex]);

  const datasets = useMemo(() => {
    // TODO: pensar una mejor forma en el futuro
    // Quizas agregar un promedio
    _clonedFinancialPlans.forEach((plan) => {
      plan.financialSnapshots.push(
        _avalancheFinancialPlan!.financialSnapshots[0]
      );
    });

    const monthlyDebtsMap: Record<string, { [key: string]: number | Date }> =
      {};
    [
      ..._clonedFinancialPlans,
      _avalancheFinancialPlan,
      _snowballFinancialPlan,
    ].forEach((plan) => {
      if (!plan) return;
      plan.financialSnapshots.forEach((snapshot) => {
        const monthKey = snapshot.date.startOf('month').format('YYYY-MM');

        if (!monthlyDebtsMap[monthKey]) {
          monthlyDebtsMap[monthKey] = {
            date: snapshot.date.startOf('month').toDate(),
          };
        }

        const totalDebts = financeUtils.getTotalDebts(snapshot.debts);
        monthlyDebtsMap[monthKey][plan.name] = totalDebts;
      });
    });

    const datasetsResult = Object.values(monthlyDebtsMap).sort(
      (a, b) => (a.date as Date).getTime() - (b.date as Date).getTime()
    );

    return datasetsResult;
  }, [financialPlans, currentIndex]);

  const series = useMemo(() => {
    const plans = [
      ..._clonedFinancialPlans,
      _avalancheFinancialPlan,
      _snowballFinancialPlan,
    ].filter(Boolean) as IFinancialPlan[];

    return plans.map((plan, index) => ({
      dataKey: plan.name,
      color: getColorForPlan(index, plans.length, theme.palette.primary.main),
      valueFormatter: (value: any, i: any) =>
        `$${value?.toFixed(2)} ${
          datasets[i.dataIndex].date > new Date() ? ` (Prediction)` : ''
        }`,
    }));
  }, [financialPlans, currentIndex, theme]);

  if (loading) return null;

  return (
    <Box sx={{ width: '100%', aspectRatio: '2' }}>
      <LineChart
        loading={loading}
        sx={{
          ml: -4,
          height: '100%',
          '& .line-after path': { strokeDasharray: '10 5' },
        }}
        grid={{ vertical: true, horizontal: true }}
        dataset={datasets}
        xAxis={[
          {
            scaleType: 'time',
            dataKey: 'date',
            valueFormatter: (value: Date) => dayjs(value).format('MM/YY'),
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value: number) => formatCompactNumber(value),
            label: 'Price (USD)',
          },
        ]}
        series={series}
        slots={{ line: CustomAnimatedLine }}
        slotProps={{
          line: {
            limit: new Date(),
          } as any,
        }}
      />
    </Box>
  );
};

export default PersonalFinancesGraph;
