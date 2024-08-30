import { Box, Button, ButtonGroup, SxProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IPortfolioSnapshot } from 'src/models/finances';
import { formatCurrency, formatPercentage } from 'src/utils';

interface Props {
  portfolioSnapshot: IPortfolioSnapshot;
  setSelectedFilter: (instrument: string) => void;
  selectedFilter: string;
  sx?: SxProps;
}

const SelectInstrumentFilter = ({
  portfolioSnapshot,
  selectedFilter,
  setSelectedFilter,
  sx,
}: Props) => {
  const { t } = useTranslation();
  const handleSelect = (instrument: string) => () => {
    setSelectedFilter(instrument);
  };

  return (
    <Box sx={sx}>
      <ButtonGroup
        size="large"
        aria-label="select filter"
        orientation="vertical"
      >
        <Button
          variant={selectedFilter === 'total' ? 'contained' : 'outlined'}
          onClick={handleSelect('total')}
        >
          <Box>
            <Typography variant="body2">{t('common.total')}</Typography>
            <Typography variant="caption">
              {formatCurrency(portfolioSnapshot.totalValue)}
            </Typography>
          </Box>
        </Button>
        {portfolioSnapshot.instruments.map((instrument) => (
          <Button
            key={instrument.id}
            variant={
              selectedFilter === instrument.id ? 'contained' : 'outlined'
            }
            onClick={handleSelect(instrument.id!)}
          >
            <Box>
              <Typography variant="body2">{instrument.name}</Typography>
              <Typography variant="caption">
                {formatPercentage(instrument.positionPercentage)}
              </Typography>
            </Box>
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default SelectInstrumentFilter;
