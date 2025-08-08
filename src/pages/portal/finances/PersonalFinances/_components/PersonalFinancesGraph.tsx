import { useMemo } from 'react';

import { alpha, Box, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { IFinancialPlan } from '@shared/models/finances';
import dayjs from 'dayjs';
import { formatCompactNumber, normalizeObjectDates, toDayjs } from 'src/utils';
import { financeUtils } from '@shared/utils';
import { CustomAnimatedLine } from 'src/components/graphs';
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

  const _allPlansWithPredictions = useMemo(() => {
    return _clonedFinancialPlans.flatMap((plan, index) => {
      // El plan seleccionado (currentIndex) tiene color principal, los demás usan getColorForPlan
      const baseColor =
        index === currentIndex
          ? theme.palette.primary.main
          : getColorForPlan(
              index,
              _clonedFinancialPlans.length,
              theme.palette.primary.main
            );

      // Plan original
      const originalPlan = {
        ...plan,
        displayName: plan.name,
        color: baseColor,
      };

      // Predicciones Avalanche
      const avalancheSnapshots =
        financeUtils.generateMonthlyFinancialSnapshotsPredictions(
          plan.financialSnapshots.at(-1)!,
          EPayoffMethodType.AVALANCHE,
          NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
        );

      const avalanchePlan = {
        ...plan,
        name: `${plan.name}_AVALANCHE`,
        displayName: `${plan.name} (Avalanche)`,
        financialSnapshots: avalancheSnapshots,
        color: alpha(
          typeof baseColor === 'string'
            ? baseColor
            : theme.palette.primary.main,
          0.7
        ),
      };

      // Predicciones Snowball
      const snowballSnapshots =
        financeUtils.generateMonthlyFinancialSnapshotsPredictions(
          plan.financialSnapshots.at(-1)!,
          EPayoffMethodType.SNOWBALL,
          NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
        );

      const snowballPlan = {
        ...plan,
        name: `${plan.name}_SNOWBALL`,
        displayName: `${plan.name} (Snowball)`,
        financialSnapshots: snowballSnapshots,
        color: alpha(
          typeof baseColor === 'string'
            ? baseColor
            : theme.palette.primary.main,
          0.5
        ),
      };

      return [originalPlan, avalanchePlan, snowballPlan];
    });
  }, [_clonedFinancialPlans, currentIndex, viewSize, theme]);

  const datasets = useMemo(() => {
    // Crear un bridge snapshot para conectar los datos históricos con las predicciones
    const plansWithBridgeSnapshot = _clonedFinancialPlans.map((plan) => ({
      ...plan,
      financialSnapshots: [
        ...plan.financialSnapshots,
        // Tomar el primer snapshot de las predicciones como puente
        _allPlansWithPredictions.find(
          (p) => p.name === `${plan.name}_AVALANCHE`
        )?.financialSnapshots[0]!,
      ],
    }));

    const monthlyDebtsMap: Record<string, { [key: string]: number | Date }> =
      {};

    // Procesar planes originales con bridge
    plansWithBridgeSnapshot.forEach((plan) => {
      plan.financialSnapshots.forEach((snapshot) => {
        const monthKey = snapshot.date.startOf('month').format('YYYY-MM');

        if (!monthlyDebtsMap[monthKey]) {
          monthlyDebtsMap[monthKey] = {
            date: snapshot.date.startOf('month').toDate(),
          };
        }

        const totalDebts = financeUtils.getTotalDebts(snapshot.debts);
        // Solo agregar si el valor es válido (no undefined, null, o NaN)
        if (
          totalDebts !== undefined &&
          totalDebts !== null &&
          !isNaN(totalDebts)
        ) {
          monthlyDebtsMap[monthKey][plan.name] = totalDebts;
        }
      });
    });

    // Procesar todas las predicciones
    _allPlansWithPredictions.forEach((plan) => {
      if (plan.name.includes('_AVALANCHE') || plan.name.includes('_SNOWBALL')) {
        plan.financialSnapshots.forEach((snapshot) => {
          const monthKey = snapshot.date.startOf('month').format('YYYY-MM');

          if (!monthlyDebtsMap[monthKey]) {
            monthlyDebtsMap[monthKey] = {
              date: snapshot.date.startOf('month').toDate(),
            };
          }

          const totalDebts = financeUtils.getTotalDebts(snapshot.debts);
          // Solo agregar si el valor es válido (no undefined, null, o NaN)
          if (
            totalDebts !== undefined &&
            totalDebts !== null &&
            !isNaN(totalDebts)
          ) {
            monthlyDebtsMap[monthKey][plan.name] = totalDebts;
          }
        });
      }
    });

    const datasetsResult = Object.values(monthlyDebtsMap).sort(
      (a, b) => (a.date as Date).getTime() - (b.date as Date).getTime()
    );

    return datasetsResult;
  }, [_clonedFinancialPlans, _allPlansWithPredictions]);

  const series = useMemo(() => {
    // Crear todas las series: planes originales + predicciones
    const allSeries: any[] = [];

    // Primero añadir los planes originales (solo si tienen datos históricos válidos)
    _clonedFinancialPlans.forEach((plan, index) => {
      // Verificar que el plan tenga snapshots Y que al menos uno tenga datos de deuda válidos
      if (plan.financialSnapshots && plan.financialSnapshots.length > 0) {
        const hasValidHistoricalData = plan.financialSnapshots.some(
          (snapshot) => {
            const totalDebts = financeUtils.getTotalDebts(snapshot.debts);
            return (
              totalDebts !== undefined &&
              totalDebts !== null &&
              !isNaN(totalDebts)
            );
          }
        );

        if (hasValidHistoricalData) {
          const color =
            index === currentIndex
              ? theme.palette.primary.main
              : getColorForPlan(
                  index,
                  _clonedFinancialPlans.length,
                  theme.palette.primary.main
                );

          allSeries.push({
            dataKey: plan.name,
            color: color,
            valueFormatter: (value: any, i: any) => {
              if (value === undefined || value === null || isNaN(value)) {
                return 'No data';
              }
              return `$${value?.toFixed(2)} ${
                datasets[i.dataIndex].date > new Date() ? ` (Prediction)` : ''
              }`;
            },
          });
        }
      }
    });

    // Luego añadir las predicciones (solo si tienen datos válidos)
    _allPlansWithPredictions.forEach((plan) => {
      if (plan.name.includes('_AVALANCHE') || plan.name.includes('_SNOWBALL')) {
        // Verificar que las predicciones tienen snapshots válidos Y datos válidos
        if (plan.financialSnapshots && plan.financialSnapshots.length > 0) {
          const hasValidPredictionData = plan.financialSnapshots.some(
            (snapshot) => {
              const totalDebts = financeUtils.getTotalDebts(snapshot.debts);
              return (
                totalDebts !== undefined &&
                totalDebts !== null &&
                !isNaN(totalDebts)
              );
            }
          );

          if (hasValidPredictionData) {
            allSeries.push({
              dataKey: plan.name,
              color: plan.color,
              valueFormatter: (value: any) => {
                if (value === undefined || value === null || isNaN(value)) {
                  return 'No data';
                }
                return `$${value?.toFixed(2)} ${plan.displayName} (Prediction)`;
              },
            });
          }
        }
      }
    });

    return allSeries;
  }, [
    _clonedFinancialPlans,
    _allPlansWithPredictions,
    currentIndex,
    theme,
    datasets,
  ]);

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
