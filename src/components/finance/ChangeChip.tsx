import {
  ArrowDownward as TrendingDownIcon,
  ArrowUpward as TrendingUpIcon,
} from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { formatCurrency, formatPercentage } from 'src/utils';

type Props = {
  changePercentage?: number;
  change?: number;
  size?: 'small' | 'large';
  changeDigits?: number;
};

const ChangeChip: React.FC<Props> = ({
  changePercentage,
  change,
  size = 'small',
  changeDigits = 2,
}) => {
  if (changePercentage === undefined && change === undefined) {
    return null;
  }

  const displayChange = change || changePercentage || 0;

  return (
    <Box
      sx={{
        bgcolor:
          displayChange === 0
            ? 'grey.300'
            : displayChange > 0
              ? 'rgb(220,252,231)'
              : 'rgb(252,232,230)',
        borderRadius: 1,
        p: 1,
      }}
    >
      <Stack gap={0} direction={'column'}>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant={size === 'small' ? 'body2' : 'h6'}
              color={
                displayChange == 0
                  ? 'grey.500'
                  : displayChange > 0
                    ? 'success.main'
                    : 'error.main'
              }
              fontWeight={size === 'small' ? 600 : 500}
            >
              {formatCurrency(change)}
            </Typography>
          </Box>
        )}
        {changePercentage !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            {displayChange === 0 ? (
              <Typography
                variant={size === 'small' ? 'body2' : 'h6'}
                color="text.secondary"
                fontWeight={size === 'small' ? 600 : 500}
              >
                •
              </Typography>
            ) : (
              <>
                {displayChange >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
              </>
            )}
            <Typography
              variant={size === 'small' ? 'body2' : 'h6'}
              color={
                displayChange == 0
                  ? 'grey.500'
                  : displayChange > 0
                    ? 'success.main'
                    : 'error.main'
              }
              fontWeight={size === 'small' ? 600 : 500}
            >
              {formatPercentage(changePercentage, changeDigits, true)}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ChangeChip;
