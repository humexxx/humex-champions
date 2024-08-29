import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useMemo } from 'react';
import { DashedGraph } from 'src/components';
import { IPortfolioSnapshot } from 'src/models/finances';
import { formatCurrency, getNextQuarterDate } from 'src/utils';

const DEFAULT_PERCENTAGE_INCREMENT_PER_TRIMESTRE = 0.03;
const TOTAL_PREDICTIONS = 12;

function predictNextPortafolioSnapshots(
  portfolioSnapshots: IPortfolioSnapshot[]
): IPortfolioSnapshot[] {
  const response: IPortfolioSnapshot[] = [...portfolioSnapshots];
  for (let i = portfolioSnapshots.length; i < TOTAL_PREDICTIONS; i++) {
    const lastSnapshot = response[i - 1];
    const data: Partial<IPortfolioSnapshot> = {
      date: dayjs(getNextQuarterDate(lastSnapshot.date.toDate())),
      id: i.toString(),
      instruments: lastSnapshot.instruments.map((instrument) => ({
        ...instrument,
        value:
          instrument.value * (1 + DEFAULT_PERCENTAGE_INCREMENT_PER_TRIMESTRE),
      })),
    };
    data.totalValue = data.instruments!.reduce(
      (acc, instrument) => acc + instrument.value,
      0
    );
    data.totalProfit = data.totalValue - lastSnapshot.totalValue;
    data.totalProfitPercentage =
      (data.totalProfit / lastSnapshot.totalValue) * 100;
    response.push(data as IPortfolioSnapshot);
  }
  return response;
}

interface Props {
  portfolioSnapshots: IPortfolioSnapshot[];
}

const Graph = ({ portfolioSnapshots }: Props) => {
  const datasets = useMemo(() => {
    const datasets = predictNextPortafolioSnapshots(portfolioSnapshots).map(
      (snapshot) => ({
        date: snapshot.date.toDate(),
        ...(snapshot.instruments.reduce(
          (acc, instrument) => ({
            ...acc,
            [instrument.name]: instrument.value,
          }),
          {}
        ) as any),
      })
    );
    return datasets;
  }, [portfolioSnapshots]);

  const uniqueInstruments = useMemo(() => {
    const instruments = new Set<string>();
    portfolioSnapshots.forEach((snapshot) =>
      snapshot.instruments.forEach((instrument) =>
        instruments.add(instrument.name)
      )
    );
    return Array.from(instruments);
  }, [portfolioSnapshots]);

  return (
    <Box width={'100%'} height={500}>
      <LineChart
        dataset={datasets}
        series={uniqueInstruments.map((instrument) => ({
          dataKey: instrument,
          valueFormatter: (value, i) =>
            `$${value?.toFixed(2)}` +
            (datasets[i.dataIndex].date > new Date()
              ? ` (${t('finances.portfolio.predicted')})`
              : ''),
        }))}
        xAxis={[
          {
            scaleType: 'utc',
            data: datasets.map((data) => data.date),
            valueFormatter: (value) => dayjs(value).format('MMM YYYY'),
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) => `$${value?.toFixed(2)}`,
          },
        ]}
        slots={{ line: DashedGraph }}
        slotProps={{
          line: {
            limit: new Date(),
            sxAfter: { strokeDasharray: '5 5' },
          } as any,
        }}
        margin={{ left: 80 }}
      />
    </Box>
  );
};

export default Graph;
