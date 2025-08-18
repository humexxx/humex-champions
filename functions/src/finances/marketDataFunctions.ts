import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { PolygonService } from '../services/financial/polygon.js';
import { AssetSearchResult, PriceUpdate } from '../services/financial/types.js';

// Define interface for price data to avoid 'any' types
interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

// Define interface for portfolio position to ensure type safety
interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
  lastPriceUpdate?: Date | FieldValue;
}

const db = getFirestore();

// ==========================================
// 1. ASSET SEARCH FOR ORDERS
// ==========================================

/**
 * Searches available assets for users to create orders
 */
export const searchTradableAssets = onCall<{
  query: string;
  type?: 'all' | 'stocks' | 'etfs' | 'crypto';
  limit?: number;
}>(
  {
    memory: '512MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { query, type = 'all', limit = 20 } = request.data;

    if (!query || query.length < 2) {
      throw new HttpsError(
        'invalid-argument',
        'Query must be at least 2 characters'
      );
    }

    try {
      const apiKey = await getPolygonApiKey();
      const polygonService = new PolygonService(apiKey);

      let result: AssetSearchResult;

      switch (type) {
        case 'stocks': {
          const stocks = await polygonService.getPopularStocks(limit);
          result = {
            assets: stocks.filter(
              (s) =>
                s.symbol.toLowerCase().includes(query.toLowerCase()) ||
                s.name.toLowerCase().includes(query.toLowerCase())
            ),
            total: stocks.length,
            hasMore: false,
          };
          break;
        }
        case 'etfs': {
          const etfs = await polygonService.getETFs(limit);
          result = {
            assets: etfs.filter(
              (e) =>
                e.symbol.toLowerCase().includes(query.toLowerCase()) ||
                e.name.toLowerCase().includes(query.toLowerCase())
            ),
            total: etfs.length,
            hasMore: false,
          };
          break;
        }
        case 'crypto': {
          const cryptos = await polygonService.getPopularCryptos();
          result = {
            assets: cryptos.filter(
              (c) =>
                c.symbol.toLowerCase().includes(query.toLowerCase()) ||
                c.name.toLowerCase().includes(query.toLowerCase())
            ),
            total: cryptos.length,
            hasMore: false,
          };
          break;
        }
        default:
          result = await polygonService.searchAssets(query, limit);
          break;
      }

      logger.info(
        `Asset search completed: ${result.assets.length} results for "${query}"`
      );
      return result;
    } catch (error) {
      logger.error('Error searching assets:', error);
      throw new HttpsError('internal', 'Failed to search assets');
    }
  }
);

/**
 * Gets detailed information for a specific asset
 */
export const getAssetDetails = onCall<{ symbol: string }>(
  {
    memory: '512MiB',
    timeoutSeconds: 15,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { symbol } = request.data;

    if (!symbol) {
      throw new HttpsError('invalid-argument', 'Symbol is required');
    }

    try {
      const apiKey = await getPolygonApiKey();
      const polygonService = new PolygonService(apiKey);

      const asset = await polygonService.getAssetDetails(symbol.toUpperCase());

      logger.info(`Asset details retrieved for ${symbol}`);
      return asset;
    } catch (error) {
      logger.error(`Error getting asset details for ${symbol}:`, error);
      throw new HttpsError('internal', 'Failed to get asset details');
    }
  }
);

/**
 * Gets current price for a specific asset
 */
export const getAssetPrice = onCall<{ symbol: string }>(
  {
    memory: '512MiB',
    timeoutSeconds: 15,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { symbol } = request.data;

    if (!symbol) {
      throw new HttpsError('invalid-argument', 'Symbol is required');
    }

    try {
      const apiKey = await getPolygonApiKey();
      const polygonService = new PolygonService(apiKey);

      // Try to get stock price first
      try {
        const stockPrice = await polygonService.getStockPrice(
          symbol.toUpperCase()
        );
        logger.info(
          `Stock price retrieved for ${symbol}: $${stockPrice.price}`
        );
        return stockPrice;
      } catch (stockError) {
        // If stock fails, try crypto
        logger.info(`Stock price failed for ${symbol}, trying crypto...`);
        const cryptoPrice = await polygonService.getCryptoPrice(
          symbol.toUpperCase()
        );
        logger.info(
          `Crypto price retrieved for ${symbol}: $${cryptoPrice.price}`
        );
        return cryptoPrice;
      }
    } catch (error) {
      logger.error(`Error getting price for ${symbol}:`, error);
      throw new HttpsError('internal', 'Failed to get asset price');
    }
  }
);

// ==========================================
// 2. REAL-TIME PRICES
// ==========================================

/**
 * Gets current prices for assets in watchlist
 */
export const getWatchlistPrices = onCall<{ symbols: string[] }>(
  {
    memory: '1GiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { symbols } = request.data;

    if (!symbols || symbols.length === 0) {
      throw new HttpsError('invalid-argument', 'Symbols array is required');
    }

    if (symbols.length > 100) {
      throw new HttpsError('invalid-argument', 'Maximum 100 symbols allowed');
    }

    try {
      // First try to get prices from cache (Firestore)
      const cachedPrices = await getCachedPrices(symbols);
      const missingSymbols = symbols.filter((symbol) => !cachedPrices[symbol]);

      const freshPrices: Record<string, PriceData> = {};

      // Only make API calls for symbols not cached or outdated
      if (missingSymbols.length > 0) {
        const apiKey = await getPolygonApiKey();
        const polygonService = new PolygonService(apiKey);

        const priceUpdates =
          await polygonService.getBatchPriceUpdates(missingSymbols);

        // Update cache
        await updatePriceCache(priceUpdates);

        // Convert to expected format
        priceUpdates.forEach((update) => {
          freshPrices[update.symbol] = {
            symbol: update.symbol,
            price: update.price,
            change: update.change,
            changePercent: update.changePercent,
            timestamp: update.timestamp,
          };
        });
      }

      const allPrices = { ...cachedPrices, ...freshPrices };

      logger.info(
        `Prices retrieved: ${Object.keys(allPrices).length} symbols (${missingSymbols.length} from API)`
      );
      return allPrices;
    } catch (error) {
      logger.error('Error getting watchlist prices:', error);
      throw new HttpsError('internal', 'Failed to get prices');
    }
  }
);

/**
 * Forces price update for specific symbols
 */
export const refreshAssetPrices = onCall<{ symbols: string[] }>(
  {
    memory: '1GiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { symbols } = request.data;

    if (!symbols || symbols.length === 0) {
      throw new HttpsError('invalid-argument', 'Symbols array is required');
    }

    try {
      const apiKey = await getPolygonApiKey();
      const polygonService = new PolygonService(apiKey);

      const priceUpdates = await polygonService.getBatchPriceUpdates(symbols);

      // Update cache in Firestore
      await updatePriceCache(priceUpdates);

      // Update portfolios containing these symbols
      await updatePortfoliosWithNewPrices(symbols, priceUpdates);

      const prices = priceUpdates.reduce(
        (acc, update) => {
          acc[update.symbol] = {
            symbol: update.symbol,
            price: update.price,
            change: update.change,
            changePercent: update.changePercent,
            timestamp: update.timestamp,
          };
          return acc;
        },
        {} as Record<string, PriceData>
      );

      logger.info(`Refreshed prices for ${symbols.length} symbols`);
      return prices;
    } catch (error) {
      logger.error('Error refreshing asset prices:', error);
      throw new HttpsError('internal', 'Failed to refresh prices');
    }
  }
);

// ==========================================
// 3. PORTFOLIO INTEGRATION
// ==========================================

/**
 * Updates a specific portfolio with fresh prices
 */
export const updatePortfolioWithCurrentPrices = onCall<{
  userId: string;
  portfolioId: string;
}>(
  {
    memory: '512MiB',
    timeoutSeconds: 45,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, portfolioId } = request.data;

    try {
      // Obtener el portfolio
      const portfolioRef = db
        .collection('users')
        .doc(userId)
        .collection('portfolio')
        .doc(portfolioId);
      const portfolioDoc = await portfolioRef.get();

      if (!portfolioDoc.exists) {
        throw new HttpsError('not-found', 'Portfolio not found');
      }

      const portfolio = portfolioDoc.data();
      if (!portfolio?.positions) {
        return { message: 'No positions to update' };
      }

      // Extract unique symbols
      const symbols = [
        ...new Set(
          portfolio.positions
            .map((p: PortfolioPosition) => p.symbol?.toUpperCase())
            .filter(Boolean)
        ),
      ] as string[];

      if (symbols.length === 0) {
        return { message: 'No valid symbols found' };
      }

      // Get current prices
      const apiKey = await getPolygonApiKey();
      const polygonService = new PolygonService(apiKey);
      const priceUpdates = await polygonService.getBatchPriceUpdates(symbols);

      // Create price map
      const priceMap = new Map(
        priceUpdates.map((update) => [update.symbol, update])
      );

      // Update positions
      let totalValue = 0;
      let totalCost = 0;

      const updatedPositions = portfolio.positions.map(
        (position: PortfolioPosition) => {
          const priceUpdate = priceMap.get(position.symbol?.toUpperCase());

          if (priceUpdate) {
            const currentValue = position.shares * priceUpdate.price;
            const costBasis = position.shares * position.avgPrice;

            totalValue += currentValue;
            totalCost += costBasis;

            return {
              ...position,
              currentPrice: priceUpdate.price,
              currentValue,
              pnl: currentValue - costBasis,
              pnlPercent: ((currentValue - costBasis) / costBasis) * 100,
              lastPriceUpdate: new Date(),
            };
          } else {
            // Keep existing values if no update available
            totalValue += position.currentValue || 0;
            totalCost += position.shares * position.avgPrice || 0;
            return position;
          }
        }
      );

      const totalPnL = totalValue - totalCost;
      const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

      // Update portfolio in Firestore
      await portfolioRef.update({
        positions: updatedPositions,
        totalValue,
        totalCost,
        totalPnL,
        totalPnLPercent,
        lastPriceUpdate: FieldValue.serverTimestamp(),
      });

      logger.info(`Updated portfolio ${portfolioId} with fresh prices`);

      return {
        message: 'Portfolio updated successfully',
        totalValue,
        totalPnL,
        totalPnLPercent,
        updatedPositions: updatedPositions.length,
      };
    } catch (error) {
      logger.error('Error updating portfolio with current prices:', error);
      throw new HttpsError('internal', 'Failed to update portfolio');
    }
  }
);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getPolygonApiKey(): Promise<string> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    throw new Error('POLYGON_API_KEY environment variable not configured');
  }

  return apiKey;
}

async function getCachedPrices(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  const cachedPrices: Record<string, PriceData> = {};
  const currentTime = Date.now();
  const cacheExpiry = 5 * 60 * 1000; // 5 minutes

  for (const symbol of symbols) {
    try {
      const priceDoc = await db
        .collection('market_data')
        .doc('prices')
        .collection('current')
        .doc(symbol.toUpperCase())
        .get();

      if (priceDoc.exists) {
        const data = priceDoc.data();
        const lastUpdate = data?.lastUpdate?.toDate?.()?.getTime() || 0;

        // Only use cache if recent
        if (currentTime - lastUpdate < cacheExpiry && data) {
          cachedPrices[symbol.toUpperCase()] = {
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            timestamp: data.timestamp,
          };
        }
      }
    } catch (error) {
      // Skip individual cache errors
      continue;
    }
  }

  return cachedPrices;
}

async function updatePriceCache(priceUpdates: PriceUpdate[]): Promise<void> {
  const batch = db.batch();
  const timestamp = new Date();

  priceUpdates.forEach((update) => {
    const priceRef = db
      .collection('market_data')
      .doc('prices')
      .collection('current')
      .doc(update.symbol);

    batch.set(priceRef, {
      symbol: update.symbol,
      price: update.price,
      change: update.change,
      changePercent: update.changePercent,
      timestamp: update.timestamp,
      lastUpdate: timestamp,
    });
  });

  await batch.commit();
}

async function updatePortfoliosWithNewPrices(
  symbols: string[],
  priceUpdates: PriceUpdate[]
): Promise<void> {
  const priceMap = new Map(
    priceUpdates.map((update) => [update.symbol, update])
  );

  // Search for portfolios containing these symbols
  const portfoliosSnapshot = await db
    .collectionGroup('portfolio')
    .where('positions', '!=', null)
    .get();

  const batch = db.batch();
  let updatedCount = 0;

  portfoliosSnapshot.forEach((doc) => {
    const portfolio = doc.data();

    if (!portfolio.positions) return;

    const hasTargetSymbols = portfolio.positions.some(
      (position: PortfolioPosition) =>
        symbols.includes(position.symbol?.toUpperCase())
    );

    if (!hasTargetSymbols) return;

    let totalValue = 0;
    let totalCost = 0;
    let hasUpdates = false;

    const updatedPositions = portfolio.positions.map(
      (position: PortfolioPosition) => {
        const priceUpdate = priceMap.get(position.symbol?.toUpperCase());

        if (priceUpdate) {
          hasUpdates = true;
          const currentValue = position.shares * priceUpdate.price;
          const costBasis = position.shares * position.avgPrice;

          totalValue += currentValue;
          totalCost += costBasis;

          return {
            ...position,
            currentPrice: priceUpdate.price,
            currentValue,
            pnl: currentValue - costBasis,
            pnlPercent: ((currentValue - costBasis) / costBasis) * 100,
            lastPriceUpdate: FieldValue.serverTimestamp(),
          };
        } else {
          totalValue += position.currentValue || 0;
          totalCost += position.shares * position.avgPrice || 0;
          return position;
        }
      }
    );

    if (hasUpdates) {
      const totalPnL = totalValue - totalCost;
      const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

      batch.update(doc.ref, {
        positions: updatedPositions,
        totalValue,
        totalCost,
        totalPnL,
        totalPnLPercent,
        lastPriceUpdate: FieldValue.serverTimestamp(),
      });

      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    logger.info(`Updated ${updatedCount} portfolios with new prices`);
  }
}
