/**
 * Transaction-related types for portfolio module
 */

// Transaction form data for UI forms
export interface TransactionFormData {
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  executedAt: string;
  notes: string;
}

// Transaction type enumeration
export type TransactionType = 'BUY' | 'SELL';

// Transaction status for approval workflow
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

// Extended transaction types for different operations
export type ExtendedTransactionType =
  | TransactionType
  | 'DIVIDEND'
  | 'SPLIT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

/**
 * Asset-related types for portfolio module
 */

// Core asset interface
export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  exchange?: string;
  price?: number;
  change?: number;
  changePercent?: number;

  // System asset properties
  isSystemAsset?: boolean;
  monthlyYield?: number; // 0.007 para 0.7% mensual
  description?: string;
  riskLevel?: RiskLevel;
}

// Asset type enumeration
export type AssetType = 'stock' | 'etf' | 'crypto' | 'system';

// Risk level enumeration
export type RiskLevel = 'low' | 'medium' | 'high';

// Asset filter type for search/filtering
export type AssetFilterType = 'all' | 'stock' | 'etf' | 'crypto' | 'system';

// Asset type options for UI components
export const ASSET_TYPES = [
  { value: 'all' as const, label: 'All' },
  { value: 'stock' as const, label: 'Stocks' },
  { value: 'etf' as const, label: 'ETFs' },
  { value: 'crypto' as const, label: 'Crypto' },
  { value: 'system' as const, label: 'HumEx Products' },
] as const;

// Asset category for better organization
export type AssetCategory = 'external' | 'internal';
