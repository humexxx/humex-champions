import { Box, Button, ButtonGroup, useTheme } from '@mui/material';
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
      {/* Time Filter Buttons */}
      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="text" size="small">
          {timeFilters.map((filter) => (
            <Button
              key={filter}
              variant={selectedTimeFilter === filter ? 'contained' : 'text'}
              onClick={() => onTimeFilterChange(filter)}
              sx={{
                minWidth: 40,
                textTransform: 'none',
                ...(selectedTimeFilter === filter && {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                }),
              }}
            >
              {filter}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 300, mb: 3 }}>
        <LineChart
          width={800}
          height={300}
          series={[
            {
              data: chartData,
              area: true,
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
          margin={{ left: 0, right: 0, top: 20, bottom: 50 }}
          sx={{
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
