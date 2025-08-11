import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { TimeFilter } from '../../../../../../shared/enums/finance/timeFilters';
import { formatCompactNumber } from 'src/utils/number';
import NoDataOverlay from 'src/components/graphs/NoDataOverlay';
import LoadingOverlay from 'src/components/graphs/LoadingOverlay';

interface PortfolioChartProps {
  chartData: number[];
  chartLabels: string[];
  selectedTimeFilter: TimeFilter;
  timeFilters: readonly TimeFilter[];
  onTimeFilterChange: (filter: TimeFilter) => void;
  loading?: boolean;
}

const PortfolioChart = ({
  chartData,
  chartLabels,
  selectedTimeFilter,
  timeFilters,
  onTimeFilterChange,
  loading = false,
}: PortfolioChartProps) => {
  const theme = useTheme();

  // Check if we have meaningful data
  const hasData =
    !loading &&
    chartData &&
    chartData.length > 0 &&
    chartData.some((value) => value > 0);

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
      <Box sx={{ width: '100%', aspectRatio: '2', mb: 3 }}>
        <LineChart
          loading={loading}
          series={[
            {
              data: chartData,
              color: theme.palette.primary.main,
              highlightScope: { highlight: 'item' },
              showMark: false,
            },
          ]}
          xAxis={[
            {
              tickInterval: (_, index) => {
                return index % Math.ceil(chartLabels.length / 5) === 0;
              },
              scaleType: 'point',
              data: hasData ? chartLabels : ['No Data'],
              tickLabelStyle: {
                fontSize: 12,
                fill: theme.palette.text.secondary,
              },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: {
                fontSize: 12,
                fill: theme.palette.text.secondary,
              },
              valueFormatter: (value: any) => formatCompactNumber(value),
            },
          ]}
          grid={{ horizontal: true, vertical: true }}
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
        />
      </Box>
    </>
  );
};

export default PortfolioChart;
