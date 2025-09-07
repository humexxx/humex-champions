import { IAsset } from '@shared/types/finances';

export const MOCK_ASSET: IAsset = {
  id: 'asset_1',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 150,
  isSystemAsset: false,
  change: 1.5,
  changePercent: 1.01,
  isActive: true,
  market: 'stocks',
  exchange: 'NASDAQ',
};

export const MOCK_SYSTEM_ASSET: IAsset = {
  symbol: 'HUMEX-YIELD',
  name: 'HumEx Monthly Yield Fund',
  market: 'system',
  isActive: true,

  isSystemAsset: true,
  monthlyYield: 0.007, // 0.7% monthly
  description: 'Fixed monthly yield of 0.7% with compound interest',
  riskLevel: 'low',
  exchange: 'HUMEX',
};
