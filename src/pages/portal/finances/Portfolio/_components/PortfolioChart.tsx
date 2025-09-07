import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { AxisValueFormatterContext } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts/LineChart';
import { IPortfolioSnapshot } from '@shared/types/finances';
import dayjs from 'dayjs';
import LoadingOverlay from 'src/components/graphs/LoadingOverlay';
import NoDataOverlay from 'src/components/graphs/NoDataOverlay';
import { formatCompactNumber, formatCurrency } from 'src/utils/number';
import { TimeFilter } from '../../../../../../shared/enums/finance/timeFilters';

interface PortfolioChartProps {
  snapshots: IPortfolioSnapshot[];
  selectedTimeFilter: TimeFilter;
  timeFilters: readonly TimeFilter[];
  onTimeFilterChange: (filter: TimeFilter) => void;
  loading?: boolean;
}

const PortfolioChart = ({
  snapshots,
  selectedTimeFilter,
  timeFilters,
  onTimeFilterChange,
  loading = false,
}: PortfolioChartProps) => {
  const theme = useTheme();

  const hasData = !loading && snapshots && snapshots.length > 1;

  console.log('Rendering PortfolioChart with snapshots:', snapshots);

  return (
    <>
      <Box>
        <Tabs
          value={selectedTimeFilter}
          onChange={(_, newValue) => onTimeFilterChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              minWidth: 60,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        >
          {timeFilters.map((filter) => (
            <Tab key={filter} label={filter} value={filter} />
          ))}
        </Tabs>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', aspectRatio: '7/3', mb: 3 }}>
        <LineChart
          loading={loading}
          dataset={hasData ? (snapshots as any) : []}
          series={[
            {
              label: 'Total',
              color: theme.palette.primary.main,
              dataKey: 'currentValue',
              showMark: false,
              area: true,
              curve: 'linear',
              valueFormatter: (value: any) => formatCurrency(value),
            },
          ]}
          sx={{
            // Add gradient styling for the area
            '& .MuiAreaElement-root': {
              fill: "url('#portfolioGradient')",
            },
          }}
          xAxis={[
            {
              dataKey: 'date',
              scaleType: 'time',
              tickNumber: 4,
              domainLimit: 'strict',
              valueFormatter: (
                value: Date,
                context: AxisValueFormatterContext<'time'>
              ) => {
                if (context.location === 'tick') {
                  return dayjs(value).format('DD MMM');
                }
                return dayjs(value).format('DD MMM YYYY');
              },
            },
          ]}
          yAxis={[
            {
              valueFormatter: (value: number) => formatCompactNumber(value),
            },
          ]}
          hideLegend
          grid={{ horizontal: true, vertical: false }}
          margin={{ left: 0 }}
          slots={
            {
              noDataOverlay: NoDataOverlay,
              loadingOverlay: LoadingOverlay,
            } as any
          }
          slotProps={
            {
              noDataOverlay: {
                message: 'No portfolio data available',
                description:
                  'Start by adding some transactions to see your portfolio growth',
              },
              loadingOverlay: {
                message: 'Loading portfolio data...',
              },
            } as any
          }
        >
          {/* SVG Gradient Definition */}
          <defs>
            <linearGradient
              id="portfolioGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={theme.palette.primary.main}
                stopOpacity={0.3}
              />
              <stop
                offset="25%"
                stopColor={theme.palette.primary.main}
                stopOpacity={0.1}
              />
              <stop
                offset="50%"
                stopColor={theme.palette.primary.main}
                stopOpacity={0.02}
              />
              <stop
                offset="100%"
                stopColor={theme.palette.primary.main}
                stopOpacity={0.01}
              />
            </linearGradient>
          </defs>
        </LineChart>
      </Box>
    </>
  );
};

export default PortfolioChart;
