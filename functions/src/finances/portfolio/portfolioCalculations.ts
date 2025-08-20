import { FIRESTORE_PATHS } from '@shared/consts';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';

const db = admin.firestore();

// ============= TYPES =============

interface PortfolioHolding {
  id?: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

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

interface PortfolioSnapshot {
  id?: string;
  date: string; // YYYY-MM-DD format
  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  totalInvested: number;
  dailyGain: number;
  dailyGainPercentage: number;
  holdings: Record<string, unknown>[]; // Flexible holding structure for snapshots
  createdAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

interface PortfolioUpdateData {
  portfolioId: string;
  totals: {
    currentValue: number;
    totalGain: number;
    totalGainPercentage: number;
    totalInvested: number;
    dailyGain: number;
    dailyGainPercentage: number;
  };
  holdings: PortfolioHolding[];
  assetPrices: Record<string, Asset>; // Add asset prices for transaction updates
  transactions: admin.firestore.DocumentData[]; // Add transactions for batch updates
}

// ============= BATCH PORTFOLIO UPDATE FUNCTIONS =============

/**
 * Updates multiple portfolios for a user using batch operations
 * Follows read-then-write pattern for consistency
 * @param {string} userId - The user ID
 * @return {Promise<Object>} Update results with counts and errors
 */
export const updateUserPortfolios = async (
  userId: string
): Promise<{
  updatedPortfolios: number;
  updatedSnapshots: number;
  errors: string[];
}> => {
  const batch = db.batch();
  const errors: string[] = [];
  let updatedPortfolios = 0;
  let updatedSnapshots = 0;

  try {
    // STEP 1: READ ALL DATA FIRST
    logger.info(`Starting portfolio updates for user: ${userId}`);

    // Get all portfolios for the user
    const portfoliosSnapshot = await db
      .collection(FIRESTORE_PATHS.FINANCES.PORTFOLIOS(userId))
      .get();

    if (portfoliosSnapshot.empty) {
      logger.info(`No portfolios found for user: ${userId}`);
      return { updatedPortfolios: 0, updatedSnapshots: 0, errors: [] };
    }

    // Collect all portfolio update data
    const portfolioUpdates: PortfolioUpdateData[] = [];

    for (const portfolioDoc of portfoliosSnapshot.docs) {
      try {
        const portfolioId = portfolioDoc.id;

        // Get all holdings for this portfolio
        const holdingsSnapshot = await db
          .collection(FIRESTORE_PATHS.FINANCES.HOLDINGS(userId, portfolioId))
          .get();

        if (holdingsSnapshot.empty) {
          logger.info(`No holdings found for portfolio: ${portfolioId}`);
          continue;
        }

        // Get unique asset IDs
        const assetIds = new Set<string>();
        const holdings: PortfolioHolding[] = [];

        holdingsSnapshot.docs.forEach((holdingDoc) => {
          const holding = holdingDoc.data() as PortfolioHolding;
          holding.id = holdingDoc.id;
          holdings.push(holding);
          assetIds.add(holding.assetId);
        });

        // Batch read all required assets
        const assetDocs = await Promise.all(
          Array.from(assetIds).map((assetId) =>
            db.doc(FIRESTORE_PATHS.ASSETS.ASSET(assetId)).get()
          )
        );

        // Create asset price lookup
        const assetPrices: Record<string, Asset> = {};
        assetDocs.forEach((assetDoc) => {
          if (assetDoc.exists) {
            const asset = assetDoc.data() as Asset;
            assetPrices[assetDoc.id] = asset;
          }
        });

        // Calculate portfolio totals
        const totals = calculatePortfolioTotalsFromData(holdings, assetPrices);

        // Get all transactions for this portfolio
        const transactionsSnapshot = await db
          .collection(
            FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId)
          )
          .get();

        const transactions = transactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        portfolioUpdates.push({
          portfolioId,
          totals,
          holdings,
          assetPrices, // Add asset prices to the update object
          transactions, // Add transactions for batch updates
        });
      } catch (error) {
        const errorMsg = `Error processing portfolio ${portfolioDoc.id}: ${error}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // STEP 2: WRITE ALL UPDATES IN BATCH
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    for (const update of portfolioUpdates) {
      try {
        // Update portfolio document
        const portfolioRef = db.doc(
          FIRESTORE_PATHS.FINANCES.PORTFOLIO(userId, update.portfolioId)
        );

        batch.update(portfolioRef, {
          currentValue: update.totals.currentValue,
          totalGain: update.totals.totalGain,
          totalGainPercentage: update.totals.totalGainPercentage,
          totalInvested: update.totals.totalInvested,
          dailyGain: update.totals.dailyGain,
          dailyGainPercentage: update.totals.dailyGainPercentage,
          lastPriceUpdate: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create/update today's snapshot
        const snapshotRef = db.doc(
          FIRESTORE_PATHS.FINANCES.SNAPSHOT(userId, update.portfolioId, today)
        );

        const snapshotData: Partial<PortfolioSnapshot> = {
          date: today,
          currentValue: update.totals.currentValue,
          totalGain: update.totals.totalGain,
          totalGainPercentage: update.totals.totalGainPercentage,
          totalInvested: update.totals.totalInvested,
          dailyGain: update.totals.dailyGain,
          dailyGainPercentage: update.totals.dailyGainPercentage,
          holdings: update.holdings.map((h) => ({ ...h })) as Record<
            string,
            unknown
          >[],
          updatedAt: FieldValue.serverTimestamp(),
        };

        // Check if snapshot already exists
        const snapshotDoc = await snapshotRef.get();
        if (snapshotDoc.exists) {
          batch.update(snapshotRef, snapshotData);
        } else {
          batch.set(snapshotRef, {
            ...snapshotData,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        // Update transaction current market values in the same batch
        updateTransactionValuesInBatch(
          userId,
          update.portfolioId,
          update.assetPrices,
          update.transactions,
          batch
        );

        updatedPortfolios++;
        updatedSnapshots++;
      } catch (error) {
        const errorMsg = `Error preparing batch update for portfolio ${update.portfolioId}: ${error}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // STEP 3: COMMIT BATCH
    if (updatedPortfolios > 0) {
      await batch.commit();
      logger.info(
        `Successfully updated ${updatedPortfolios} portfolios for user ${userId}`
      );
    }

    return {
      updatedPortfolios,
      updatedSnapshots,
      errors,
    };
  } catch (error) {
    logger.error(`Error updating portfolios for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Updates portfolios for all users using batch operations
 * @return {Promise<Object>} Update results with counts and errors
 */
export const updateAllPortfolios = async (): Promise<{
  updatedUsers: number;
  updatedPortfolios: number;
  updatedSnapshots: number;
  errors: string[];
}> => {
  try {
    logger.info('Starting batch update for all portfolios');

    // Get all users who have portfolios
    const usersSnapshot = await db.collection('users').get();

    let updatedUsers = 0;
    let totalUpdatedPortfolios = 0;
    let totalUpdatedSnapshots = 0;
    const allErrors: string[] = [];

    // Process users in batches to avoid memory issues
    const userBatches: string[][] = [];
    const batchSize = 10; // Process 10 users at a time
    const userIds = usersSnapshot.docs.map((doc) => doc.id);

    for (let i = 0; i < userIds.length; i += batchSize) {
      userBatches.push(userIds.slice(i, i + batchSize));
    }

    for (const userBatch of userBatches) {
      const batchPromises = userBatch.map(async (userId) => {
        try {
          // Check if user has portfolios
          const portfoliosSnapshot = await db
            .collection(FIRESTORE_PATHS.FINANCES.PORTFOLIOS(userId))
            .limit(1)
            .get();

          if (portfoliosSnapshot.empty) {
            return { updatedPortfolios: 0, updatedSnapshots: 0, errors: [] };
          }

          return await updateUserPortfolios(userId);
        } catch (error) {
          const errorMsg = `Error updating portfolios for user ${userId}: ${error}`;
          logger.error(errorMsg);
          return {
            updatedPortfolios: 0,
            updatedSnapshots: 0,
            errors: [errorMsg],
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((result) => {
        if (result.updatedPortfolios > 0) {
          updatedUsers++;
        }
        totalUpdatedPortfolios += result.updatedPortfolios;
        totalUpdatedSnapshots += result.updatedSnapshots;
        allErrors.push(...result.errors);
      });
    }

    logger.info('Completed batch update for all portfolios', {
      updatedUsers,
      updatedPortfolios: totalUpdatedPortfolios,
      updatedSnapshots: totalUpdatedSnapshots,
      errorCount: allErrors.length,
    });

    return {
      updatedUsers,
      updatedPortfolios: totalUpdatedPortfolios,
      updatedSnapshots: totalUpdatedSnapshots,
      errors: allErrors,
    };
  } catch (error) {
    logger.error('Error in batch portfolio update:', error);
    throw error;
  }
};

// ============= HELPER FUNCTIONS =============

/**
 * Calculates portfolio totals from holdings and asset data
 * @param {PortfolioHolding[]} holdings - Array of portfolio holdings
 * @param {Record<string, Asset>} assetPrices - Asset price lookup object
 * @return {Object} Portfolio calculation results
 */
function calculatePortfolioTotalsFromData(
  holdings: PortfolioHolding[],
  assetPrices: Record<string, Asset>
): {
  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  totalInvested: number;
  dailyGain: number;
  dailyGainPercentage: number;
} {
  let totalCurrentValue = 0;
  let totalInvested = 0;
  let totalDailyGain = 0;

  for (const holding of holdings) {
    const asset = assetPrices[holding.assetId];

    if (asset) {
      const currentValue = holding.quantity * asset.currentPrice;
      const dailyChange = asset.dailyChange || 0;
      const dailyGainForHolding = holding.quantity * dailyChange;

      totalCurrentValue += currentValue;
      totalInvested += holding.totalInvested;
      totalDailyGain += dailyGainForHolding;
    } else {
      // Asset not found, use last known values or skip
      totalInvested += holding.totalInvested;
      logger.warn(`Asset not found for holding: ${holding.assetId}`);
    }
  }

  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPercentage =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const dailyGainPercentage =
    totalCurrentValue > 0 ? (totalDailyGain / totalCurrentValue) * 100 : 0;

  return {
    currentValue: totalCurrentValue,
    totalGain,
    totalGainPercentage,
    totalInvested,
    dailyGain: totalDailyGain,
    dailyGainPercentage,
  };
}

/**
 * Updates transaction current market values in the provided batch
 * @param {string} userId - The user ID
 * @param {string} portfolioId - The portfolio ID
 * @param {Record<string, Asset>} assetPrices - Asset price lookup
 * @param {admin.firestore.DocumentData[]} transactions - Transaction documents
 * @param {admin.firestore.WriteBatch} batch - Firestore batch for updates
 */
function updateTransactionValuesInBatch(
  userId: string,
  portfolioId: string,
  assetPrices: Record<string, Asset>,
  transactions: admin.firestore.DocumentData[],
  batch: admin.firestore.WriteBatch
): void {
  try {
    // Update each transaction with current market value and P&L
    transactions.forEach((transactionData) => {
      const { id, assetId, quantity, price: originalPrice } = transactionData;

      // Get current asset price
      const currentAsset = assetPrices[assetId];
      if (currentAsset && currentAsset.currentPrice && id) {
        const currentValue = quantity * currentAsset.currentPrice;
        const originalValue = quantity * originalPrice;
        const gainLoss = currentValue - originalValue;
        const gainLossPercentage =
          originalValue > 0 ? (gainLoss / originalValue) * 100 : 0;

        // Update transaction with current market data
        const transactionRef = db.doc(
          FIRESTORE_PATHS.FINANCES.TRANSACTION(userId, portfolioId, id)
        );

        batch.update(transactionRef, {
          currentPrice: currentAsset.currentPrice,
          currentValue,
          gainLoss,
          gainLossPercentage,
          lastPriceUpdate: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    logger.info(`Updated transaction values for portfolio: ${portfolioId}`);
  } catch (error) {
    logger.error(
      `Error updating transaction values for portfolio ${portfolioId}:`,
      error
    );
    throw error;
  }
}
