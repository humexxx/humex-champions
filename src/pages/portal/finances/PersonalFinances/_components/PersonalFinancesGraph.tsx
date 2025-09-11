import { useMemo } from 'react';

import { alpha, Box, useMediaQuery, useTheme } from '@mui/material';
import { LineChart, LineSeries } from '@mui/x-charts';
import { IFinancialPlan, IPortfolioSnapshot } from '@shared/types/finances';
import { financeUtils } from '@shared/utils';
import dayjs from 'dayjs';
import { CustomAnimatedLine } from 'src/components/graphs';
import {
  formatCompactNumber,
  formatCurrency,
  normalizeObjectDates,
  toDayjs,
} from 'src/utils';

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

// Colores específicos para diferentes tipos de datos
const CHART_COLORS = {
  debt: '#f44336', // Rojo para deudas
  portfolio: '#2196f3', // Azul para portfolio
};

interface Props {
  financialPlans: IFinancialPlan[];
  loading: boolean;
  currentIndex: number;
  portfolioSnapshots?: IPortfolioSnapshot[];
}

const PersonalFinancesGraph = ({
  financialPlans,
  loading,
  currentIndex,
  portfolioSnapshots = [],
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
      // Cambiar a color rojo para las deudas
      const baseColor =
        index === currentIndex
          ? CHART_COLORS.debt
          : getColorForPlan(
              index,
              _clonedFinancialPlans.length,
              CHART_COLORS.debt
            );

      // Plan original
      const originalPlan = {
        ...plan,
        displayName: plan.name,
        color: baseColor,
      };

      // Verificar si hay snapshots y deudas antes de generar predicciones
      const lastSnapshot = plan.financialSnapshots.at(-1);
      if (!lastSnapshot || !lastSnapshot.debts.length) {
        // Si no hay snapshots o no hay deudas, solo retornamos el plan original
        return [originalPlan];
      }

      // Verificar si hay deudas pendientes
      const totalDebts = financeUtils.getTotalDebts(lastSnapshot.debts);
      if (totalDebts <= 0) {
        // Si no hay deudas pendientes, solo retornamos el plan original
        return [originalPlan];
      }

      // Predicciones Avalanche
      const avalancheSnapshots =
        financeUtils.generateMonthlyFinancialSnapshotsPredictions(
          lastSnapshot,
          'AVALANCHE',
          NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
        );

      const avalanchePlan = {
        ...plan,
        name: `${plan.name}_AVALANCHE`,
        displayName: `${plan.name} (Avalanche)`,
        financialSnapshots: avalancheSnapshots,
        color: alpha(
          typeof baseColor === 'string' ? baseColor : CHART_COLORS.debt,
          0.5
        ),
      };

      // Predicciones Snowball
      const snowballSnapshots =
        financeUtils.generateMonthlyFinancialSnapshotsPredictions(
          lastSnapshot,
          'SNOWBALL',
          NUMBER_OF_MONTHS_FUTURE_TO_SHOW[viewSize]
        );

      const snowballPlan = {
        ...plan,
        name: `${plan.name}_SNOWBALL`,
        displayName: `${plan.name} (Snowball)`,
        financialSnapshots: snowballSnapshots,
        color: alpha(
          typeof baseColor === 'string' ? baseColor : CHART_COLORS.debt,
          0.5
        ),
      };

      return [originalPlan, avalanchePlan, snowballPlan];
    });
  }, [_clonedFinancialPlans, currentIndex, viewSize, theme]);

  const datasets = useMemo(() => {
    // Crear un bridge snapshot para conectar los datos históricos con las predicciones
    const plansWithBridgeSnapshot = _clonedFinancialPlans.map((plan) => {
      // Buscar si hay predicciones Avalanche para este plan
      const avalanchePlan = _allPlansWithPredictions.find(
        (p) => p.name === `${plan.name}_AVALANCHE`
      );

      // Si hay predicciones Avalanche, incluir el primer snapshot como bridge
      const bridgeSnapshot = avalanchePlan?.financialSnapshots[0];

      return {
        ...plan,
        financialSnapshots: [
          ...plan.financialSnapshots,
          // Solo agregar bridge snapshot si existe
          ...(bridgeSnapshot ? [bridgeSnapshot] : []),
        ],
      };
    });

    const monthlyDataMap: Record<string, { [key: string]: number | Date }> = {};

    // Procesar planes originales con bridge (DEUDAS)
    plansWithBridgeSnapshot.forEach((plan) => {
      plan.financialSnapshots.forEach((snapshot) => {
        const monthKey = snapshot.date.startOf('month').format('YYYY-MM');

        if (!monthlyDataMap[monthKey]) {
          monthlyDataMap[monthKey] = {
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
          monthlyDataMap[monthKey][plan.name] = totalDebts;
        }
      });
    });

    // Procesar snapshots del portfolio (VALOR DEL PORTFOLIO)
    if (portfolioSnapshots && portfolioSnapshots.length > 0) {
      const normalizedPortfolioSnapshots = normalizeObjectDates<
        IPortfolioSnapshot[]
      >(structuredClone(portfolioSnapshots), toDayjs);

      normalizedPortfolioSnapshots.forEach((snapshot) => {
        const monthKey = snapshot.createdAt.startOf('month').format('YYYY-MM');

        if (!monthlyDataMap[monthKey]) {
          monthlyDataMap[monthKey] = {
            date: snapshot.createdAt.startOf('month').toDate(),
          };
        }

        // Agregar el valor total del portfolio
        if (
          snapshot.totalValue !== undefined &&
          snapshot.totalValue !== null &&
          !isNaN(snapshot.totalValue)
        ) {
          monthlyDataMap[monthKey]['Portfolio'] = snapshot.totalValue;
        }
      });
    }

    // Procesar todas las predicciones (DEUDAS)
    _allPlansWithPredictions.forEach((plan) => {
      if (plan.name.includes('_AVALANCHE') || plan.name.includes('_SNOWBALL')) {
        plan.financialSnapshots.forEach((snapshot) => {
          const monthKey = snapshot.date.startOf('month').format('YYYY-MM');

          if (!monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey] = {
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
            monthlyDataMap[monthKey][plan.name] = totalDebts;
          }
        });
      }
    });

    const datasetsResult = Object.values(monthlyDataMap).sort(
      (a, b) => (a.date as Date).getTime() - (b.date as Date).getTime()
    );

    return datasetsResult;
  }, [_clonedFinancialPlans, _allPlansWithPredictions, portfolioSnapshots]);

  const series = useMemo(() => {
    // Crear todas las series: planes originales + predicciones + portfolio
    const allSeries: LineSeries[] = [];

    // Primero añadir los planes originales de deudas (solo si tienen datos históricos válidos)
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
              ? CHART_COLORS.debt
              : getColorForPlan(
                  index,
                  _clonedFinancialPlans.length,
                  CHART_COLORS.debt
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

    // Añadir la serie del portfolio (si hay snapshots válidos)
    if (portfolioSnapshots && portfolioSnapshots.length > 0) {
      const hasValidPortfolioData = portfolioSnapshots.some((snapshot) => {
        return (
          snapshot.totalValue !== undefined &&
          snapshot.totalValue !== null &&
          !isNaN(snapshot.totalValue)
        );
      });

      if (hasValidPortfolioData) {
        allSeries.push({
          dataKey: 'Portfolio',
          color: CHART_COLORS.portfolio,
          valueFormatter: (value: any) => {
            if (value === undefined || value === null || isNaN(value)) {
              return 'No data';
            }
            return `$${value?.toFixed(2)} Portfolio Value`;
          },
        });
      }
    }

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
                return formatCurrency(value) + ` (Prediction)`;
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
    portfolioSnapshots,
    currentIndex,
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
