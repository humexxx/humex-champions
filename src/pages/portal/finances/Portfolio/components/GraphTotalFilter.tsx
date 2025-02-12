import { Box, Button, ButtonGroup, SxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  setSelectedFilter: (instrument: 'total' | 'value') => void;
  selectedFilter: 'total' | 'value';
  sx?: SxProps;
}

const GraphTotalFilter = ({ selectedFilter, setSelectedFilter, sx }: Props) => {
  const { t } = useTranslation();
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
          {t('common.total')}
        </Button>
        <Button
          variant={selectedFilter === 'value' ? 'contained' : 'outlined'}
          onClick={handleSelect('value')}
        >
          {t('common.value')}
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default GraphTotalFilter;
