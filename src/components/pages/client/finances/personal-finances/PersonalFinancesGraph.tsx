import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useMemo } from 'react';
import { DashedGraph } from 'src/components/common';

const debtsData = [
  90000, 89000, 85000, 82000, 60000, 55000, 41000, 39000, 30000, 25000, 19000,
  11000,
];
const savingsData = [
  1000, 2500, 5000, 8000, 10000, 15000, 20000, 25000, 30000, 35000, 40000,
  63000,
];

function getLabels() {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const now = new Date();
  const currentMonth = now.getMonth();
  const startMonthIndex = (currentMonth - 3 + 12) % 12;

  const result = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (startMonthIndex + i) % 12;
    result.push(months[monthIndex]);
  }

  return result;
}

const estimateTimeToSavings = () => {
  for (let i = 0; i < debtsData.length; i++) {
    if (savingsData[i] > debtsData[i]) {
      return `Estimated time to have more savings than debts: ${i + 1} months.`;
    }
  }
  return 'It will take more than a year to have more savings than debts.';
};

const PersonalFinancesGraph = () => {
  const xLabels = useMemo(() => getLabels(), []);
  const estimatedTimeMessage = estimateTimeToSavings();

  return (
    <Box width={'100%'} height={500}>
      <LineChart
        series={[
          {
            data: savingsData,
            label: 'Savings',
            color: 'green',
            valueFormatter: (value) => `$${value}`,
          },
          {
            data: debtsData,
            label: 'Debts',
            color: 'red',
            valueFormatter: (value) => `$${value}`,
          },
        ]}
        xAxis={[
          {
            data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            label: 'Month',
            scaleType: 'point',
            valueFormatter: (value) => xLabels[value],
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
          line: { limit: 3, sxAfter: { strokeDasharray: '10 5' } } as any,
        }}
      />
      <Box mt={2}>
        <Typography variant="body1">{estimatedTimeMessage}</Typography>
      </Box>
    </Box>
  );
};

export default PersonalFinancesGraph;
