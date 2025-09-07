import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import ChangeChip from 'src/components/finance/ChangeChip';
import { formatCurrency } from 'src/utils';
import {
  TimeFilter,
  getTimeFilterText,
} from '../../../../../../shared/enums/finance/timeFilters';

interface PortfolioHeaderProps {
  name: string;
  totalValue: number;
  totalGain: number;
  totalGainPercentage: number;
  lastUpdate: dayjs.Dayjs;
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
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="h3" component={'p'} sx={{ mb: 1 }}>
            {formatCurrency(totalValue)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ChangeChip changePercentage={totalGainPercentage} />
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: colorScheme, fontWeight: 600 }}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(totalGain)} {getTimeFilterText(selectedTimeFilter)}
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {lastUpdate.format('MMM D, YYYY h:mm A')} (Last updated)
        </Typography>
      </Box>
    </>
  );
};

export default PortfolioHeader;
