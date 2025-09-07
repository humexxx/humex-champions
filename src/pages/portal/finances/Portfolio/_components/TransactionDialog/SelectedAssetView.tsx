import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { IAsset, Market } from '@shared/types/finances';
import React from 'react';

interface SelectedAssetViewProps {
  asset: IAsset;
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
                label={asset.market!.toUpperCase()}
                size="small"
                color={getMarketColor(asset.market!)}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {asset.name}
            </Typography>
            {asset.isSystemAsset && asset.description && (
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ mb: 1, fontStyle: 'italic' }}
              >
                {asset.description}
              </Typography>
            )}
            {asset.isSystemAsset && asset.monthlyYield && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mb: 1, fontWeight: 'medium' }}
              >
                Monthly Yield: {(asset.monthlyYield * 100).toFixed(2)}% • Risk
                Level: {asset.riskLevel}
              </Typography>
            )}
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
                {asset.isSystemAsset && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    Base Price
                  </Typography>
                )}
              </Typography>
              {asset.changePercent !== undefined && !asset.isSystemAsset && (
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

export function getMarketColor(
  market: Market
): 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'default' {
  return market === 'system'
    ? 'primary'
    : market === 'crypto'
      ? 'warning'
      : market === 'stocks'
        ? 'secondary'
        : market === 'fx'
          ? 'info'
          : market === 'otc'
            ? 'default'
            : market === 'indices'
              ? 'success'
              : 'default';
}

export default SelectedAssetView;
