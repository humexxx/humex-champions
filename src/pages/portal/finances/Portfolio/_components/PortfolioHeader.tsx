import { Box, Typography, Stack } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatCurrency, formatPercentage } from 'src/utils';
import {
  TimeFilter,
  getTimeFilterText,
} from '../../../../../../shared/enums/finance/timeFilters';

interface PortfolioHeaderProps {
  name: string;
  totalValue: number;
  totalGain: number;
  totalGainPercentage: number;
  lastUpdate: string;
  selectedTimeFilter: TimeFilter;
}

const PortfolioHeader = ({
  name,
  totalValue,
  totalGain,
  totalGainPercentage,
  lastUpdate,
  selectedTimeFilter,
}: PortfolioHeaderProps) => {
  const isPositive = totalGain >= 0;
  const colorScheme = isPositive ? 'success.main' : 'error.main';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">{name}</Typography>
      </Box>

      {/* Portfolio Value */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h3" sx={{ fontWeight: 300, mb: 1 }}>
            {formatCurrency(totalValue)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TrendIcon sx={{ color: colorScheme, fontSize: 16 }} />
            <Typography sx={{ color: colorScheme, fontWeight: 500 }}>
              {formatPercentage(Math.abs(totalGainPercentage))}
            </Typography>
          </Stack>
          <Typography sx={{ color: colorScheme, fontWeight: 500 }}>
            {isPositive ? '+' : ''}
            {formatCurrency(totalGain)} {getTimeFilterText(selectedTimeFilter)}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {lastUpdate}
        </Typography>
      </Box>
    </>
  );
};

export default PortfolioHeader;
