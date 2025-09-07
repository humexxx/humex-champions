import { z } from 'zod';

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
