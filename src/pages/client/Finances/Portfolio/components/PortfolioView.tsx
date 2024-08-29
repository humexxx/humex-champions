import { Box } from '@mui/material';
import { IPortfolioSnapshot } from 'src/models/finances';
import SelectInstrumentFilter from './SelectInstrumentFilter';
import { useMemo, useState } from 'react';
import Graph from './Graph';

interface Props {
  portfolioSnapshots: IPortfolioSnapshot[];
}

const Portfolio = ({ portfolioSnapshots }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('total');

  const filteredSnapshots = useMemo(
    () =>
      portfolioSnapshots.map((snapshot) => ({
        ...snapshot,
        instruments:
          selectedFilter === 'total'
            ? snapshot.instruments
            : snapshot.instruments.filter(
                (instrument) => instrument.id === selectedFilter
              ),
      })),
    [portfolioSnapshots, selectedFilter]
  );

  return (
    <Box display="flex">
      <Box width={120} minWidth={120}>
        <SelectInstrumentFilter
          portfolioSnapshot={portfolioSnapshots.at(-1)!}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </Box>
      <Box flex="1">
        <Graph portfolioSnapshots={filteredSnapshots} />
      </Box>
    </Box>
  );
};

export default Portfolio;
