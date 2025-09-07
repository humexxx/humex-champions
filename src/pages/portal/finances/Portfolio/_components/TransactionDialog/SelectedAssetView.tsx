import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { IAsset, Market } from '@shared/types/finances';
import React from 'react';
import ChangeChip from 'src/components/finance/ChangeChip';
import { formatCurrency } from 'src/utils';

interface SelectedAssetViewProps {
  asset: IAsset;
  loading?: boolean;
}

const SelectedAssetView: React.FC<SelectedAssetViewProps> = ({
  asset,
  loading,
}) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction={'row'} justifyContent="space-between">
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <Chip
              label={asset.market.toUpperCase()}
              size="small"
              color={getMarketColor(asset.market)}
            />
            <Typography variant="h6" component="div">
              {asset.symbol}
            </Typography>
            {asset.exchange && (
              <Typography variant="body2" color="text.secondary">
                Exchange: {asset.exchange}
              </Typography>
            )}
          </Stack>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            {loading ? (
              <CircularProgress size={24} />
            ) : asset.isSystemAsset ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Risk Level: {asset.riskLevel}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  • Monthly Yield:
                </Typography>
                <ChangeChip changePercentage={asset.monthlyYield} />
              </>
            ) : (
              <>
                <Typography variant="h6" component="div">
                  {formatCurrency(asset.price ?? 0)}
                </Typography>
                <ChangeChip changePercentage={asset.changePercent} />
              </>
            )}
          </Stack>
        </Stack>
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
