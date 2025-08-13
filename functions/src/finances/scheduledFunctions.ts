import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { PolygonService } from '../services/financial/polygon.js';
import { PriceUpdate } from '../services/financial/types.js';

// Define interface for portfolio position
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

/**
 * Automatic function that updates prices every hour
 * Runs Monday to Friday, 9 AM - 4 PM EST (market hours)
 */
export const updatePortfolioPrices = onSchedule(
  {
    schedule: '0 9-16 * * 1-5', // Every hour during market hours
    timeZone: 'America/New_York',
    memory: '1GiB',
    timeoutSeconds: 300, // 5 minutes
  },
  async () => {
    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // Testing getter methods first before enabling automatic updates
    logger.info('Portfolio price updates temporarily disabled for testing');
    return;

    const startTime = Date.now();
    logger.info('Starting portfolio price updates');

    try {
      // 1. Get all unique symbols from all portfolios
      const watchedSymbols = await getWatchedSymbols();

      if (watchedSymbols.length === 0) {
        logger.info('No symbols to update');
        return;
      }

      logger.info(
        `Updating prices for ${watchedSymbols.length} symbols:`,
        watchedSymbols
      );

      // 2. Get API key from environment variables
      const apiKey = process.env.POLYGON_API_KEY;

      if (!apiKey) {
        throw new Error('POLYGON_API_KEY environment variable not configured');
      }

      // 3. Create client and get prices
      const polygonService = new PolygonService(apiKey as string);
      const priceUpdates =
        await polygonService.getBatchPriceUpdates(watchedSymbols);

      logger.info(`Retrieved ${priceUpdates.length} price updates`);

      // 4. Update prices in Firestore in batch
      await updatePricesInFirestore(priceUpdates);

      // 5. Update affected portfolios
      await updatePortfolioValues(priceUpdates);

      const duration = Date.now() - startTime;
      logger.info(`Portfolio price update completed in ${duration}ms`);
    } catch (err) {
      const error = err as Error;
      logger.error('Error updating portfolio prices:', error);

      // Save error for debugging
      await db.collection('system_logs').add({
        type: 'price_update_error',
        error: error.message || 'Unknown error',
        timestamp: FieldValue.serverTimestamp(),
      });

      throw err;
    }
  }
);

/**
 * Function that runs when portfolios change
 * Automatically adds new symbols to watchlist
 */
export const onPortfolioChange = onSchedule(
  {
    schedule: '*/15 * * * *', // Every 15 minutes
    timeZone: 'UTC',
    memory: '512MiB',
  },
  async () => {
    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // Testing getter methods first before enabling automatic portfolio monitoring
    logger.info('Portfolio change monitoring temporarily disabled for testing');
    return;

    logger.info('Checking for new symbols in portfolios');

    try {
      // Get all portfolios
      const portfoliosSnapshot = await db.collectionGroup('portfolio').get();
      const allSymbols = new Set<string>();

      portfoliosSnapshot.forEach((doc) => {
        const portfolio = doc.data();
        if (portfolio.positions) {
          portfolio.positions.forEach((position: PortfolioPosition) => {
            if (position.symbol) {
              allSymbols.add(position.symbol.toUpperCase());
            }
          });
        }
      });

      // Get symbols already in watchlist
      const watchlistSnapshot = await db
        .collection('market_data')
        .doc('watchlist')
        .get();
      const existingSymbols = new Set(watchlistSnapshot.data()?.symbols || []);

      // Find new symbols
      const newSymbols = Array.from(allSymbols).filter(
        (symbol) => !existingSymbols.has(symbol)
      );

      if (newSymbols.length > 0) {
        logger.info(
          `Adding ${newSymbols.length} new symbols to watchlist:`,
          newSymbols
        );

        await db
          .collection('market_data')
          .doc('watchlist')
          .set({
            symbols: Array.from(allSymbols),
            lastUpdated: FieldValue.serverTimestamp(),
          });
      }
    } catch (error) {
      logger.error('Error updating watchlist:', error);
    }
  }
);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Gets all symbols that are being watched
 */
async function getWatchedSymbols(): Promise<string[]> {
  const watchlistDoc = await db
    .collection('market_data')
    .doc('watchlist')
    .get();
  return watchlistDoc.data()?.symbols || [];
}

/**
 * Updates prices in Firestore using batch writes
 * @param {PriceUpdate[]} priceUpdates - Array of PriceUpdate objects containing symbol and pricing data
 */
async function updatePricesInFirestore(
  priceUpdates: PriceUpdate[]
): Promise<void> {
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
      timestamp: FieldValue.serverTimestamp(),
      lastUpdate: timestamp,
    });

    // Also save in daily historic
    const historicRef = db
      .collection('market_data')
      .doc('prices')
      .collection('historic')
      .doc(`${update.symbol}_${timestamp.toISOString().split('T')[0]}`);

    batch.set(
      historicRef,
      {
        symbol: update.symbol,
        price: update.price,
        date: timestamp.toISOString().split('T')[0],
        timestamp: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
  logger.info(`Updated ${priceUpdates.length} prices in Firestore`);
}

/**
 * Updates calculated portfolio values
 * @param {PriceUpdate[]} priceUpdates - Array of price update objects
 */
async function updatePortfolioValues(
  priceUpdates: PriceUpdate[]
): Promise<void> {
  const priceMap = new Map(
    priceUpdates.map((update) => [update.symbol, update])
  );

  // Get all portfolios
  const portfoliosSnapshot = await db.collectionGroup('portfolio').get();
  const batch = db.batch();
  let updatedCount = 0;

  portfoliosSnapshot.forEach((doc) => {
    const portfolio = doc.data();

    if (!portfolio.positions) return;

    let totalValue = 0;
    let totalCost = 0;
    let hasUpdates = false;

    // Update positions with new prices
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
          // Keep existing values
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

  if (updatedCount === 0) {
    logger.info('No portfolio updates needed');
    return;
  }

  await batch.commit();
  logger.info(`Updated ${updatedCount} portfolios`);
}

/**
 * Manual function to force price updates
 * Useful for testing and special situations
 */
export const forceUpdatePrices = onSchedule(
  {
    schedule: '0 0 1 1 *', // Never runs automatically (January 1st each year)
    timeZone: 'UTC',
  },
  async (event) => {
    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // Testing getter methods first before enabling manual price updates
    logger.info('Force price updates temporarily disabled for testing');
    return;

    // This function can be triggered manually from console
    await updatePortfolioPrices.run(event);
  }
);

/**
 * Cleanup function that removes old historical data
 * Runs once daily at 2 AM
 */
export const cleanupOldPriceData = onSchedule(
  {
    schedule: '0 2 * * *',
    timeZone: 'UTC',
    memory: '512MiB',
  },
  async () => {
    // ⚠️ TEMPORARILY DISABLED FOR TESTING
    // Testing getter methods first before enabling data cleanup
    logger.info('Price data cleanup temporarily disabled for testing');
    return;

    logger.info('Cleaning up old price data');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      const oldDataSnapshot = await db
        .collection('market_data')
        .doc('prices')
        .collection('historic')
        .where('timestamp', '<', cutoffDate)
        .limit(500) // Batch delete limit
        .get();

      if (oldDataSnapshot.empty) {
        logger.info('No old data to clean up');
        return;
      }

      const batch = db.batch();
      oldDataSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(`Cleaned up ${oldDataSnapshot.size} old price records`);
    } catch (error) {
      logger.error('Error cleaning up old price data:', error);
    }
  }
);
