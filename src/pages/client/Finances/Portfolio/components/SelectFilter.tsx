import { Box, Button, ButtonGroup } from '@mui/material';
import { IPortfolioSnapshot } from 'src/models/finances';

interface Props {
  portfolioSnapshot: IPortfolioSnapshot;
  setSelectedFilter: (instrument: string) => void;
  selectedFilter: string;
}

const SelectFilter = ({
  portfolioSnapshot,
  selectedFilter,
  setSelectedFilter,
}: Props) => {
  const handleSelect = (instrument: string) => () => {
    setSelectedFilter(instrument);
  };

  return (
    <Box>
      <ButtonGroup
        size="large"
        aria-label="select filter"
        orientation="vertical"
      >
        <Button
          variant={selectedFilter === 'total' ? 'contained' : 'outlined'}
          onClick={handleSelect('total')}
        >
          Total
        </Button>
        {portfolioSnapshot.instruments.map((instrument) => (
          <Button
            key={instrument.id}
            variant={
              selectedFilter === instrument.id ? 'contained' : 'outlined'
            }
            onClick={handleSelect(instrument.id!)}
          >
            {instrument.name}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default SelectFilter;
