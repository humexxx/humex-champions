import { ICallableRequest, ICallableResponse } from '@shared/models';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { updateAllPortfolios } from './portfolioCalculations';
import { PolygonService } from '../../services/financial/polygon.js';

const db = admin.firestore();

// ============= TYPES =============

interface Asset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  previousDayClose?: number;
  dailyChange?: number;
  dailyChangePercentage?: number;
  lastPriceUpdate: admin.firestore.Timestamp;
}

// ============= SCHEDULED FUNCTIONS =============

/**
 * Main scheduled function that updates asset prices and portfolio data
 * Runs every hour during market hours (9 AM - 4 PM EST, Monday-Friday)
 */
export const scheduledPortfolioUpdate = onSchedule(
  {
    schedule: '0 9-16 * * 1-5', // Every hour during market hours
    timeZone: 'America/New_York',
    memory: '1GiB',
    timeoutSeconds: 600, // 10 minutes
  },
  async () => {
    const startTime = Date.now();
    logger.info('Starting scheduled portfolio update');

    try {
      // Step 1: Update asset prices
      logger.info('Step 1: Updating asset prices...');
      const assetUpdateResult = await updateAssetPricesInternal();

      // Step 2: Update portfolios (only if asset prices were updated)
      if (assetUpdateResult.updatedAssets > 0) {
        logger.info('Step 2: Updating portfolio snapshots and totals...');
        const portfolioUpdateResult = await updatePortfoliosInternal();

        const duration = Date.now() - startTime;
        logger.info(`Scheduled portfolio update completed in ${duration}ms`, {
          updatedAssets: assetUpdateResult.updatedAssets,
          updatedPortfolios: portfolioUpdateResult.updatedPortfolios,
          errors: portfolioUpdateResult.errors,
        });
      } else {
        logger.info('No assets were updated, skipping portfolio updates');
      }
    } catch (error) {
      logger.error('Scheduled portfolio update failed:', error);
      throw error;
    }
  }
);

// ============= CALLABLE FUNCTIONS =============

/**
 * Callable function to manually update asset prices
 */
export const adminUpdateAssetPrices = onCall<ICallableRequest>(
  async (
    req
  ): Promise<
    ICallableResponse<{
      message: string;
      updatedAssets: number;
      assetList: string[];
      timestamp: string;
    }>
  > => {
    logger.info('Admin asset price update requested', {
      userId: req.auth?.uid,
      isAdmin: req.auth?.token?.admin,
    });

    if (!req.auth?.uid || !req.auth.token?.admin) {
      return {
        success: false,
        error: 'Only admins can manually update asset prices.',
      };
    }

    try {
      const startTime = Date.now();
      logger.info('Admin manually updating asset prices');

      const result = await updateAssetPricesInternal();
      const duration = Date.now() - startTime;

      logger.info(`Admin price update completed in ${duration}ms`);

      return {
        success: true,
        data: {
          message: `Successfully updated prices for ${result.updatedAssets} assets in ${duration}ms`,
          updatedAssets: result.updatedAssets,
          assetList: result.assetList,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Admin asset price update failed:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error updating asset prices',
      };
    }
  }
);

/**
 * Callable function to manually update portfolio snapshots and totals
 */
export const adminUpdatePortfolioSnapshots = onCall<ICallableRequest>(
  async (
    req
  ): Promise<
    ICallableResponse<{
      message: string;
      updatedUsers: number;
      updatedPortfolios: number;
      updatedSnapshots: number;
      errors: string[];
      timestamp: string;
    }>
  > => {
    logger.info('Admin portfolio snapshot update requested', {
      userId: req.auth?.uid,
      isAdmin: req.auth?.token?.admin,
    });

    if (!req.auth?.uid || !req.auth.token?.admin) {
      return {
        success: false,
        error: 'Only admins can manually update portfolio snapshots.',
      };
    }

    try {
      const startTime = Date.now();
      logger.info('Admin manually updating portfolio snapshots');

      const result = await updatePortfoliosInternal();
      const duration = Date.now() - startTime;

      logger.info(`Admin portfolio update completed in ${duration}ms`);

      return {
        success: true,
        data: {
          message: `Updated ${result.updatedPortfolios} portfolios for ${result.updatedUsers} users with ${result.errors.length} errors in ${duration}ms`,
          updatedUsers: result.updatedUsers,
          updatedPortfolios: result.updatedPortfolios,
          updatedSnapshots: result.updatedSnapshots,
          errors: result.errors,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Admin portfolio snapshot update failed:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error updating portfolio snapshots',
      };
    }
  }
);

// ============= INTERNAL HELPER FUNCTIONS =============

/**
 * Internal function to update asset prices
 * @return {Promise<Object>} Result object with count of updated assets
 */
async function updateAssetPricesInternal(): Promise<{
  updatedAssets: number;
  assetList: string[];
}> {
  try {
    // Get Polygon API key
    const apiKey = await getPolygonApiKey();
    const polygonService = new PolygonService(apiKey);

    // Get all assets that need price updates
    const assetsSnapshot = await db.collection('assets').get();

    if (assetsSnapshot.empty) {
      logger.info('No assets found for price updates');
      return { updatedAssets: 0, assetList: [] };
    }

    // Extract symbols for batch price request
    const assetSymbols: string[] = [];
    const assetMap: Record<
      string,
      { id: string; ref: admin.firestore.DocumentReference }
    > = {};

    assetsSnapshot.docs.forEach((doc) => {
      const asset = doc.data() as Asset;
      assetSymbols.push(asset.symbol);
      assetMap[asset.symbol] = {
        id: doc.id,
        ref: doc.ref,
      };
    });

    logger.info(
      `Fetching prices for ${assetSymbols.length} assets from Polygon API`
    );

    // Get batch price updates from Polygon
    const priceUpdates =
      await polygonService.getBatchPriceUpdates(assetSymbols);

    if (priceUpdates.length === 0) {
      logger.warn('No price updates received from Polygon API');
      return { updatedAssets: 0, assetList: [] };
    }

    // Prepare batch update
    const batch = db.batch();
    const updatedAssetList: string[] = [];

    for (const priceUpdate of priceUpdates) {
      const assetInfo = assetMap[priceUpdate.symbol];
      if (!assetInfo) {
        logger.warn(`Asset not found for symbol: ${priceUpdate.symbol}`);
        continue;
      }

      // Calculate daily change values
      const dailyChange = priceUpdate.change || 0;
      const dailyChangePercentage = priceUpdate.changePercent || 0;
      const previousDayClose = priceUpdate.price - dailyChange;

      // Update asset in batch
      batch.update(assetInfo.ref, {
        currentPrice: priceUpdate.price,
        previousDayClose,
        dailyChange,
        dailyChangePercentage,
        lastPriceUpdate: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      updatedAssetList.push(
        `${priceUpdate.symbol}: $${priceUpdate.price.toFixed(2)}`
      );
    }

    // Commit batch update
    if (updatedAssetList.length > 0) {
      await batch.commit();
      logger.info(
        `Successfully updated ${updatedAssetList.length} asset prices`
      );
    }

    return {
      updatedAssets: updatedAssetList.length,
      assetList: updatedAssetList,
    };
  } catch (error) {
    logger.error('Error updating asset prices:', error);
    throw error;
  }
}

/**
 * Internal function to update all portfolios with new calculations
 * @return {Promise<Object>} Result object with count of updated portfolios and errors
 */
async function updatePortfoliosInternal(): Promise<{
  updatedUsers: number;
  updatedPortfolios: number;
  updatedSnapshots: number;
  errors: string[];
}> {
  try {
    logger.info('Starting portfolio updates using batch calculations');

    // Use the new batch calculation function
    const result = await updateAllPortfolios();

    logger.info('Portfolio updates completed', {
      updatedUsers: result.updatedUsers,
      updatedPortfolios: result.updatedPortfolios,
      updatedSnapshots: result.updatedSnapshots,
      errorCount: result.errors.length,
    });

    return result;
  } catch (error) {
    logger.error('Error updating portfolios:', error);
    throw error;
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Gets Polygon API key from environment variables
 * @return {Promise<string>} The API key
 */
async function getPolygonApiKey(): Promise<string> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    throw new Error('POLYGON_API_KEY environment variable not configured');
  }

  return apiKey;
}
