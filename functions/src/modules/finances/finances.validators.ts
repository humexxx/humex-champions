import { z } from 'zod';

// Asset search input
export const SearchTradableAssetsInput = z.object({
  query: z.string().min(1, 'Query is required'),
  type: z.enum(['all', 'stocks', 'etfs', 'crypto']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchTradableAssetsInput = z.infer<
  typeof SearchTradableAssetsInput
>;

// Asset details input
export const GetAssetDetailsInput = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

export type GetAssetDetailsInput = z.infer<typeof GetAssetDetailsInput>;

// Asset price input
export const GetAssetPriceInput = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

export type GetAssetPriceInput = z.infer<typeof GetAssetPriceInput>;

// Watchlist prices input
export const GetWatchlistPricesInput = z.object({
  symbols: z
    .array(z.string().min(1))
    .min(1, 'At least one symbol required')
    .max(50, 'Maximum 50 symbols allowed'),
});

export type GetWatchlistPricesInput = z.infer<typeof GetWatchlistPricesInput>;

// Refresh asset prices input
export const RefreshAssetPricesInput = z.object({
  symbols: z
    .array(z.string().min(1))
    .min(1, 'At least one symbol required')
    .max(100, 'Maximum 100 symbols allowed'),
});

export type RefreshAssetPricesInput = z.infer<typeof RefreshAssetPricesInput>;

// Update portfolio prices input
export const UpdatePortfolioPricesInput = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  forceRefresh: z.boolean().optional().default(false),
});

export type UpdatePortfolioPricesInput = z.infer<
  typeof UpdatePortfolioPricesInput
>;
