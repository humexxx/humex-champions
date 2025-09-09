import { Dayjs } from 'dayjs';
import { z } from 'zod';
import {
  ASSET_FILTER_TYPES,
  GetAssetDetailsInput as GetAssetDetailsInputSchema,
  GetAssetPriceInput as GetAssetPriceInputSchema,
  SearchTradableAssetsInput as SearchTradableAssetsInputSchema,
  TRANSACTION_TYPES,
} from '../../schemas/finances/portfolio';

// Exported types
export type AssetFilterType = (typeof ASSET_FILTER_TYPES)[number];
export type Market = 'crypto' | 'stocks' | 'fx' | 'otc' | 'indices' | 'system';
export type RiskLevel = 'low' | 'medium' | 'high';
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface IPriceData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  updatedAt: Dayjs;
}

export interface ISystemAssetDetails {
  monthlyYield: number;
  description: string;
  riskLevel: RiskLevel;
}

export interface IAsset {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  exchange: string;
  currency: string;
  isActive: boolean;

  priceData?: IPriceData;
  previousDayClose?: number;

  isSystemAsset: boolean;
  systemAssetDetails?: ISystemAssetDetails;
}

export interface IPortfolio {
  id: string;
  userId: string;
  name: string;
  isDraft: boolean;
  createdAt: Dayjs;
  updatedAt: Dayjs;

  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyGain: number;
  dailyGainPercentage: number;

  currency: string;
  isDefault: boolean;
}

export interface IPortfolioSnapshot {
  id: string;
  portfolioId: string;

  totalInvested: number;
  totalValue: number;

  createdAt: Dayjs;
  updatedAt: Dayjs;
  holdings: IPortfolioHolding[];
}

export interface ILocalHoldingCalculations {
  portfolioPercentage: number;
  averageBuyPrice: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;
}

export interface ISystemPortfolioHoldingFlags {
  status: TransactionStatus;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: Dayjs;
}

export interface IPortfolioHolding {
  id: string;
  portfolioId: string;
  assetId: string;

  quantity: number;
  totalInvested: number;

  currentPrice: number;
  currentValue: number;

  createdAt: Dayjs;
  updatedAt: Dayjs;

  isSystemAsset: boolean;
  systemFlags?: ISystemPortfolioHoldingFlags;

  // Local calculated fields, not stored in DB
  localCalculations?: ILocalHoldingCalculations;
}

export interface IPortfolioTransaction {
  id: string;
  portfolioId: string;
  assetId: string;

  type: TransactionType;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  fees: number;

  // Optional fields if the asset is sold
  soldPrice?: number;
  soldAmount?: number;
  gainLoss?: number;
  gainLossPercentage?: number;

  executedAt: Dayjs;
  notes?: string;
}

// Import schemas to generate types
import {
  AddTransactionInputSchema,
  AssetForTransactionSchema,
  TransactionFormDataSchema,
} from '../../schemas/finances/portfolio';

// Inferred types from schemas
export type GetAssetPriceInput = z.infer<typeof GetAssetPriceInputSchema>;
export type SearchTradableAssetsInput = z.infer<
  typeof SearchTradableAssetsInputSchema
>;
export type GetAssetDetailsInput = z.infer<typeof GetAssetDetailsInputSchema>;
export type TransactionFormData = z.infer<typeof TransactionFormDataSchema>;
export type AssetForTransaction = z.infer<typeof AssetForTransactionSchema>;
export type AddTransactionInput = z.infer<typeof AddTransactionInputSchema>;

export interface AddTransactionResult {
  transactionId: string;
  assetId: string;
}
