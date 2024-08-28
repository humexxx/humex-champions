import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { t } from 'i18next';
import { DashedGraph } from 'src/components';
import { IPortfolioSnapshot } from 'src/models/finances';

interface Props {
  portfolioSnapshots: IPortfolioSnapshot[];
}

const Graph = ({ portfolioSnapshots }: Props) => {
  // Extract unique instrument names across all snapshots
  const uniqueInstruments = Array.from(
    new Set(
      portfolioSnapshots.flatMap((snapshot) =>
        snapshot.instruments.map((instrument) => instrument.name)
      )
    )
  );

  // Prepare datasets for each unique instrument
  const datasets = uniqueInstruments.map((instrumentName) => ({
    label: instrumentName,
    data: portfolioSnapshots.map((snapshot) => {
      const instrument = snapshot.instruments.find(
        (instr) => instr.name === instrumentName
      );
      return instrument ? instrument.value : 0;
    }),
  }));

  return (
    <Box width={'100%'} height={500}>
      <LineChart
        series={datasets}
        xAxis={[
          {
            data: portfolioSnapshots.map((snapshot) =>
              snapshot.date.toDate().getMonth()
            ),
            label: t('finances.personalFinances.graph.month'),
            scaleType: 'point',
            valueFormatter: (value) => {
              console.log(value);
              return '';
            },
            // value.date.format('MMM'),
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
            limit: portfolioSnapshots.length,
            sxAfter: { strokeDasharray: '5 5' },
          } as any,
        }}
      />
    </Box>
  );
};

export default Graph;
