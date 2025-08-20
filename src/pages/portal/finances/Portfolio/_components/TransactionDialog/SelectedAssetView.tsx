import React from 'react';
import { Box, Typography, Chip, Card, CardContent } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { Asset } from './types';

interface SelectedAssetViewProps {
  asset: Asset;
}

const SelectedAssetView: React.FC<SelectedAssetViewProps> = ({ asset }) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="h6" component="div">
                {asset.symbol}
              </Typography>
              <Chip
                label={asset.type.toUpperCase()}
                size="small"
                color={
                  asset.type === 'crypto'
                    ? 'warning'
                    : asset.type === 'etf'
                      ? 'info'
                      : 'default'
                }
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {asset.name}
            </Typography>
            {asset.exchange && (
              <Typography variant="body2" color="text.secondary">
                Exchange: {asset.exchange}
              </Typography>
            )}
          </Box>

          {asset.price && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" component="div">
                ${asset.price.toFixed(2)}
              </Typography>
              {asset.changePercent !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {asset.changePercent >= 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={
                      asset.changePercent >= 0 ? 'success.main' : 'error.main'
                    }
                  >
                    {asset.changePercent > 0 ? '+' : ''}
                    {asset.changePercent.toFixed(2)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SelectedAssetView;
