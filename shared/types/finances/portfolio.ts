import { Dayjs } from 'dayjs';
import { z } from 'zod';

const assetFilterTypes = ['all', 'stock', 'etf', 'crypto', 'system'] as const;
export type AssetFilterType = (typeof assetFilterTypes)[number];

export const SearchTradableAssetsInput = z.object({
  query: z.string().min(1, 'Query is required'),
  type: z.enum(assetFilterTypes).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchTradableAssetsInput = z.infer<
  typeof SearchTradableAssetsInput
>;

export const GetAssetDetailsInput = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

export type GetAssetDetailsInput = z.infer<typeof GetAssetDetailsInput>;

export type AssetType = 'stock' | 'etf' | 'crypto' | 'system';
export type AssetCategory =
  | 'CRYPTO'
  | 'STOCK'
  | 'ETF'
  | 'COMMODITY'
  | 'FOREX'
  | 'SYSTEM';
export type RiskLevel = 'low' | 'medium' | 'high';

export type TransactionType = 'BUY' | 'SELL';
export type ExtendedTransactionType =
  | TransactionType
  | 'DIVIDEND'
  | 'SPLIT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface IAsset {
  id?: string;
  symbol: string;
  name: string;
  category?: AssetCategory;
  type: AssetType;

  currentPrice?: number;
  dayOpenPrice?: number;
  dayClosePrice?: number;
  previousDayClose?: number;
  dailyChange?: number;
  dailyChangePercentage?: number;

  currency?: string;
  exchange?: string;
  lastPriceUpdate?: Dayjs;

  marketCap?: number;
  volume24h?: number;
  sector?: string;
  industry?: string;

  isSystemAsset?: boolean;
  monthlyYield?: number;
  description?: string;
  riskLevel?: RiskLevel;
  price?: number;
  change?: number;
  changePercent?: number;
}

export interface IPortfolio {
  id: string;
  userId: string;
  name: string;
  isDraft: boolean;
  createdAt: Dayjs;
  updatedAt: Dayjs;

  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyGain: number;
  dailyGainPercentage: number;
  totalInvested: number;

  currency: string;
  isDefault?: boolean;
  lastPriceUpdate?: Dayjs;
}

export interface IPortfolioSnapshot {
  id: string;
  portfolioId: string;
  date: Dayjs;

  totalValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;

  holdings: IPortfolioHolding[];
  createdAt: Dayjs;
}

export interface IPortfolioHolding {
  id: string;
  portfolioId: string;
  assetId: string;

  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;

  currentPrice: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;

  firstPurchaseDate: Dayjs;
  lastUpdateDate: Dayjs;
  portfolioPercentage: number;
}

export interface IPortfolioTransaction {
  id: string;
  portfolioId: string;
  assetId: string;

  type: ExtendedTransactionType;
  quantity: number;
  price: number; // Original purchase price
  totalAmount: number;
  fees: number;

  // Current market data (updated by portfolio calculations)
  currentPrice?: number; // Current market price per unit
  currentValue?: number; // Current total market value (quantity * currentPrice)
  gainLoss?: number; // Current gain/loss in currency
  gainLossPercentage?: number; // Current gain/loss percentage
  lastPriceUpdate?: Dayjs; // When prices were last updated

  executedAt: Dayjs;
  createdAt: Dayjs;

  notes?: string;
  source?: string;

  // Approval workflow for system assets
  status?: TransactionStatus; // Default 'approved' for regular transactions
  sourceExpenseId?: string; // Link to the fixed expense that generated this
  requiresApproval?: boolean; // True for system asset transactions
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: Dayjs;
}
