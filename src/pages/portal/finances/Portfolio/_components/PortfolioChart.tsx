import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { TimeFilter } from '../../../../../../shared/enums/finance/timeFilters';

interface PortfolioChartProps {
  chartData: number[];
  chartLabels: string[];
  selectedTimeFilter: TimeFilter;
  timeFilters: readonly TimeFilter[];
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const PortfolioChart = ({
  chartData,
  chartLabels,
  selectedTimeFilter,
  timeFilters,
  onTimeFilterChange,
}: PortfolioChartProps) => {
  const theme = useTheme();

  return (
    <>
      {/* Time Filter Tabs */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
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
          series={[
            {
              data: chartData,
              color: theme.palette.primary.main,
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: chartLabels,
              tickLabelStyle: {
                fontSize: 12,
                fill: theme.palette.text.secondary,
              },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: { display: 'none' },
            },
          ]}
          grid={{ horizontal: false, vertical: false }}
          margin={{ left: 0, right: 20, top: 20, bottom: 50 }}
          sx={{
            height: '100%',
            '& .MuiChartsAxis-line': {
              display: 'none',
            },
            '& .MuiChartsAxis-tick': {
              display: 'none',
            },
          }}
        />
      </Box>
    </>
  );
};

export default PortfolioChart;
