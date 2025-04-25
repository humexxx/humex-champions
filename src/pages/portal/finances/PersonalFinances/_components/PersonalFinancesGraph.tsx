import { useMemo } from 'react';

import { alpha, Box, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { IFinancialPlan } from '@shared/models/finances';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatCompactNumber } from 'src/utils';
import { financeUtils } from '@shared/utils';
import { EPayoffMethodType } from '@shared/enums/finance';
import { CustomAnimatedLine } from 'src/components/graphs';

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
  financialPlans: IFinancialPlan[] | null;
  loading: boolean;
}

const PersonalFinancesGraph = ({ financialPlans, loading }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const paymentType = EPayoffMethodType.AVALANCHE;

  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const viewSize = isLg ? 'lg' : isMd ? 'md' : 'sm';

  const _financialPlans = useMemo(() => {
    if (!financialPlans?.length) return [];

    return financialPlans.map((plan) => {
      const { financialSnapshots } = plan;

      let pastSnapshots = financialSnapshots.filter((snapshot) =>
        snapshot.date.isBefore(dayjs())
      );

      if (!pastSnapshots.length) {
        pastSnapshots = financeUtils.generatePastFinancialSnapshots(
          financialSnapshots,
          1
        );
      }

      const generatedFinancialSnapshots =
        paymentType === EPayoffMethodType.AVALANCHE
          ? financeUtils.generateMonthlyAvalancheFinancialSnapshots(
              pastSnapshots.at(-1)!,
              NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
            )
          : financeUtils.generateMonthlySnowballFinancialSnapshots(
              pastSnapshots.at(-1)!,
              NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
            );

      return {
        ...plan,
        financialSnapshots: [...pastSnapshots, ...generatedFinancialSnapshots],
      };
    });
  }, [financialPlans, paymentType]);

  const datasets = useMemo(() => {
    if (!_financialPlans.length) return [];
    const datasets: { date: Date; [key: string]: number | Date }[] = [];
    for (let i = 0; i < _financialPlans[0].financialSnapshots.length; i++) {
      const data = _financialPlans.reduce((acc, plan) => {
        return {
          ...acc,
          [plan.name]: plan.financialSnapshots[i].debts.reduce(
            (sum, debt) => sum + debt.pendingDebt,
            0
          ),
        };
      }, {});
      datasets.push({
        ...data,
        date: _financialPlans[0].financialSnapshots[i].date.toDate(),
      });
    }
    return datasets;
  }, [_financialPlans]);

  if (loading) return null;

  return (
    <Box sx={{ width: '100%', aspectRatio: '2' }}>
      <LineChart
        loading={loading}
        sx={{
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
        series={
          _financialPlans?.map((plan, index) => ({
            dataKey: plan.name,
            color: getColorForPlan(
              index,
              _financialPlans.length,
              theme.palette.primary.main
            ),
            valueFormatter: (value, i) =>
              `$${value?.toFixed(2)} ${
                datasets[i.dataIndex].date > new Date()
                  ? ` (${t('finances.portfolio.predicted')})`
                  : ''
              }`,
          })) ?? []
        }
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
