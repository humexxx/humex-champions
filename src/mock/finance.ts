import { IAsset } from '@shared/types/finances';
import dayjs from 'dayjs';

export const MOCK_ASSET: IAsset = {
  id: 'asset_1',
  currency: 'USD',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  isSystemAsset: false,
  isActive: true,
  market: 'stocks',
  exchange: 'NASDAQ',

  priceData: {
    price: 150,
    open: 148,
    high: 151,
    low: 147,
    close: 149,
    change: 1.5,
    changePercent: 1.01,
    symbol: 'AAPL',
    updatedAt: dayjs(),
    volume: 1000000,
  },
};

export const MOCK_SYSTEM_ASSET: IAsset = {
  id: 'humex-yield',
  symbol: 'HUMEX-YIELD',
  currency: 'USD',
  name: 'HumEx Monthly Yield Fund',
  market: 'system',
  isActive: true,

  isSystemAsset: true,
  exchange: 'HUMEX',
  systemAssetDetails: {
    monthlyYield: 0.007, // 0.7% monthly
    description: 'Fixed monthly yield of 0.7% with compound interest',
    riskLevel: 'low',
  },
};
