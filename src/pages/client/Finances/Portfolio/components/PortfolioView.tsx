import { Box, Grid } from '@mui/material';
import { IPortfolioSnapshot } from 'src/models/finances';
import SelectFilter from './SelectFilter';
import { useState } from 'react';
import Graph from './Graph';
import { toTimestamp } from 'src/utils';

interface Props {
  portfolioSnapshots: IPortfolioSnapshot[];
}

const mockData: IPortfolioSnapshot[] = [
  {
    date: toTimestamp(new Date('2021-01-01')),
    id: '1',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 50,
        value: 1000,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 50,
        value: 1000,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toTimestamp(new Date('2021-04-01')),
    id: '2',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 60,
        value: 1200,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 40,
        value: 800,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toTimestamp(new Date('2021-08-01')),
    id: '3',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 70,
        value: 1400,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 30,
        value: 600,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toTimestamp(new Date('2021-12-01')),
    id: '4',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 80,
        value: 1600,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 20,
        value: 400,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
];

const Portfolio = ({ portfolioSnapshots }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('total');

  return (
    <Box display="flex">
      <Box width={120} minWidth={120}>
        <SelectFilter
          portfolioSnapshot={portfolioSnapshots.at(-1)!}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </Box>
      <Box flex="1">
        <Graph portfolioSnapshots={/*portfolioSnapshots*/ mockData} />
      </Box>
    </Box>
  );
};

export default Portfolio;
