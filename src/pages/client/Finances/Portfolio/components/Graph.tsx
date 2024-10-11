import { useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { IPortfolioSnapshot } from '@shared/models/finances';
import dayjs, { Dayjs } from 'dayjs';
import { t } from 'i18next';
import { DashedGraph } from 'src/components';
import { getNextQuarterDate } from 'src/utils';

import GraphTotalFilter from './GraphTotalFilter';

const DEFAULT_PERCENTAGE_INCREMENT_PER_TRIMESTRE = 0.03;
const TOTAL_PREDICTIONS = 24;

function predictNextPortafolioSnapshots(
  portfolioSnapshots: IPortfolioSnapshot<Dayjs>[]
): IPortfolioSnapshot<Dayjs>[] {
  const response: IPortfolioSnapshot<Dayjs>[] = [...portfolioSnapshots];
  for (let i = portfolioSnapshots.length; i < TOTAL_PREDICTIONS; i++) {
    const lastSnapshot = response[i - 1];
    const data: Partial<IPortfolioSnapshot<Dayjs>> = {
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
    response.push(data as IPortfolioSnapshot<Dayjs>);
  }
  return response;
}

interface Props {
  portfolioSnapshots: IPortfolioSnapshot<Dayjs>[];
  isTotalFilter: boolean;
}

const stackStrategy = {
  stack: 'total',
  area: true,
  stackOffset: 'none',
} as const;

const Graph = ({ portfolioSnapshots, isTotalFilter }: Props) => {
  const [totalFilter, setTotalFilter] = useState<'total' | 'value'>('value');
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
    <>
      <Box height={45}>
        {Boolean(isTotalFilter) && (
          <GraphTotalFilter
            sx={{ marginLeft: 2 }}
            selectedFilter={totalFilter}
            setSelectedFilter={setTotalFilter}
          />
        )}
      </Box>
      <Box width={'100%'} height={500}>
        <LineChart
          grid={{ vertical: true, horizontal: true }}
          dataset={datasets}
          series={uniqueInstruments.map((instrument) => ({
            dataKey: instrument,
            valueFormatter: (value, i) =>
              `$${value?.toFixed(2)}` +
              (datasets[i.dataIndex].date > new Date()
                ? ` (${t('finances.portfolio.predicted')})`
                : ''),
            showMark: false,
            ...(totalFilter === 'total' && isTotalFilter ? stackStrategy : {}),
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
    </>
  );
};

export default Graph;
