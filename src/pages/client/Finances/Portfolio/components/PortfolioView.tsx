import { useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { IPortfolioSnapshot } from '@shared/models/finances';
import { Dayjs } from 'dayjs';

import Graph from './Graph';
import SelectInstrumentFilter from './SelectInstrumentFilter';


interface Props {
  portfolioSnapshots: IPortfolioSnapshot<Dayjs>[];
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
          sx={{ marginTop: 10 }}
          portfolioSnapshot={portfolioSnapshots.at(-1)!}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </Box>
      <Box flex="1">
        <Graph
          portfolioSnapshots={filteredSnapshots}
          isTotalFilter={selectedFilter === 'total'}
        />
      </Box>
    </Box>
  );
};

export default Portfolio;
