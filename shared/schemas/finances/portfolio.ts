import { z } from 'zod';

// Asset filter types and schema
export const ASSET_FILTER_TYPES = [
  'all',
  'stocks',
  'fx',
  'crypto',
  'otc',
  'indices',
  'system',
] as const;

// Transaction types
export const TRANSACTION_TYPES = ['buy', 'sell'] as const;

// Get Asset Price Input Schema
export const GetAssetPriceInput = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

// Search Tradable Assets Input Schema
export const SearchTradableAssetsInput = z
  .object({
    type: z.enum(ASSET_FILTER_TYPES).optional().default('all'),
    query: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional().default(20),
  })
  .refine(
    (data) =>
      data.type === 'system' ||
      (data.query != null && data.query.trim() !== ''),
    { path: ['query'], message: 'Query is required"' }
  );

// Get Asset Details Input Schema
export const GetAssetDetailsInput = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

// Transaction Form Data Schema
export const TransactionFormDataSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio is required'),
  assetId: z.string().min(1, 'Asset is required'),
  type: z.enum(TRANSACTION_TYPES, {
    message: 'Transaction type is required',
  }),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  executedAt: z.string().min(1, 'Date is required'),
  notes: z.string(),
});

// Price data schema (nested in asset)
export const PriceDataSchema = z
  .object({
    symbol: z.string(),
    price: z.number(),
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    volume: z.number(),
    change: z.number(),
    changePercent: z.number(),
    updatedAt: z.any(), // Dayjs object
  })
  .optional();

// System asset details schema (nested in asset)
export const SystemAssetDetailsSchema = z
  .object({
    monthlyYield: z.number(),
    description: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
  })
  .optional();

// Asset data for transaction
export const AssetForTransactionSchema = z.object({
  id: z.string().optional(),
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().optional(),
  market: z.enum(['crypto', 'stocks', 'fx', 'otc', 'indices', 'system']),
  exchange: z.string().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().default(true),
  priceData: PriceDataSchema,
  previousDayClose: z.number().optional(),
  isSystemAsset: z.boolean().optional(),
  systemAssetDetails: SystemAssetDetailsSchema,
});

// Add Transaction Input Schema - combines both form data and asset
export const AddTransactionInputSchema = z.object({
  transactionData: TransactionFormDataSchema,
  asset: AssetForTransactionSchema,
});

// Approve Transaction Input Schema
export const ApproveTransactionInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
});
