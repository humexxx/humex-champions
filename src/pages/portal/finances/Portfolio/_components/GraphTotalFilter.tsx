import { Box, Button, ButtonGroup, SxProps } from '@mui/material';

interface Props {
  setSelectedFilter: (instrument: 'total' | 'value') => void;
  selectedFilter: 'total' | 'value';
  sx?: SxProps;
}

const GraphTotalFilter = ({ selectedFilter, setSelectedFilter, sx }: Props) => {
  const handleSelect = (instrument: 'total' | 'value') => () => {
    setSelectedFilter(instrument);
  };

  return (
    <Box sx={sx}>
      <ButtonGroup size="large" aria-label="select filter">
        <Button
          variant={selectedFilter === 'total' ? 'contained' : 'outlined'}
          onClick={handleSelect('total')}
        >
          Total
        </Button>
        <Button
          variant={selectedFilter === 'value' ? 'contained' : 'outlined'}
          onClick={handleSelect('value')}
        >
          Value
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default GraphTotalFilter;
