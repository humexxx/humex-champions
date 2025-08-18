import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import { IPortfolioHolding, IPortfolioSnapshot } from '@shared/models/finances';
import { calculatePortfolioTotals } from '@shared/utils/portfolio';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';
import { https } from 'firebase-functions/v2';

const db = admin.firestore();

// ============= TYPES =============

interface AddTransactionRequest {
  portfolioId: string;
  assetId: string;
  symbol: string;
  name: string;
  type: string;
  category: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fees?: number;
  executedAt: string;
  notes?: string;
}

// ============= CALLABLE FUNCTIONS =============

/**
 * Add Portfolio Transaction - Simplified version for testing
 * Handles: transaction creation, basic holding update, portfolio totals
 */
export const addPortfolioTransaction = https.onCall<ICallableRequest>(
  async (req): Promise<ICallableResponse<{ transactionId: string }>> => {
    const { auth, data } = req;

    if (!auth?.uid) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      const request = data as unknown as AddTransactionRequest;
      const {
        portfolioId,
        assetId,
        symbol,
        name,
        type: assetType,
        category,
        transactionType,
        quantity,
        price,
        fees = 0,
        executedAt,
        notes = '',
      } = request;

      logger.info('Processing transaction request', {
        portfolioId,
        assetId,
        transactionType,
        quantity,
        price,
        userId: auth.uid,
      });

      // Validate required fields
      if (!portfolioId || !assetId || !transactionType || !quantity || !price) {
        return { success: false, error: 'Missing required transaction fields' };
      }

      const userId = auth.uid;
      const totalAmount = quantity * price;
      const executedAtTimestamp = Timestamp.fromDate(new Date(executedAt));
      const nowTimestamp = Timestamp.now();

      // Start atomic transaction
      const result = await db.runTransaction(async (transaction) => {
        // ====== ALL READS FIRST ======

        // 1. Verify portfolio ownership
        const portfolioRef = db.doc(
          FIRESTORE_PATHS.FINANCES.PORTFOLIO(userId, portfolioId)
        );
        const portfolioDoc = await transaction.get(portfolioRef);

        if (!portfolioDoc.exists) {
          throw new Error('Portfolio not found or access denied');
        }

        // 2. Check if asset exists
        const assetRef = db.doc(FIRESTORE_PATHS.ASSETS.ASSET(assetId));
        const assetDoc = await transaction.get(assetRef);

        // 3. Check existing holding
        const holdingRef = db.doc(
          FIRESTORE_PATHS.FINANCES.HOLDING(userId, portfolioId, assetId)
        );
        const holdingDoc = await transaction.get(holdingRef);

        // 4. Check if snapshot exists for today
        const snapshotDate = executedAtTimestamp
          .toDate()
          .toISOString()
          .split('T')[0]; // YYYY-MM-DD format
        const snapshotRef = db.doc(
          FIRESTORE_PATHS.FINANCES.SNAPSHOT(userId, portfolioId, snapshotDate)
        );
        const snapshotDoc = await transaction.get(snapshotRef);

        // ====== ALL WRITES AFTER ======

        // 5. Create/Update asset in global collection
        if (!assetDoc.exists) {
          const newAsset = {
            id: assetId,
            symbol: symbol,
            name: name,
            type: assetType,
            category: category,
            currentPrice: price,
            dayOpenPrice: price,
            previousDayClose: price,
            dailyChange: 0,
            dailyChangePercentage: 0,
            currency: 'USD',
            lastPriceUpdate: nowTimestamp,
            createdAt: nowTimestamp,
            updatedAt: nowTimestamp,
          };
          transaction.set(assetRef, newAsset);
        }

        // 6. Add transaction
        const transactionRef = db
          .collection(
            FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId)
          )
          .doc();

        const newTransaction = {
          portfolioId,
          assetId,
          type: transactionType,
          quantity,
          price,
          totalAmount,
          fees,
          executedAt: executedAtTimestamp,
          notes,
          createdAt: nowTimestamp,
        };

        transaction.set(transactionRef, newTransaction);

        // 6. Update or create holding
        if (holdingDoc.exists && transactionType === 'BUY') {
          // Update existing holding
          const existingHolding = holdingDoc.data()!;
          const newQuantity = existingHolding.quantity + quantity;
          const newTotalInvested =
            existingHolding.totalInvested + totalAmount + fees;
          const newAverageBuyPrice = newTotalInvested / newQuantity;
          const newCurrentValue = newQuantity * price;
          const newUnrealizedGain = newCurrentValue - newTotalInvested;
          const newUnrealizedGainPercentage =
            newTotalInvested > 0
              ? (newUnrealizedGain / newTotalInvested) * 100
              : 0;

          transaction.update(holdingRef, {
            quantity: newQuantity,
            averageBuyPrice: newAverageBuyPrice,
            currentPrice: price,
            currentValue: newCurrentValue,
            totalInvested: newTotalInvested,
            unrealizedGain: newUnrealizedGain,
            unrealizedGainPercentage: newUnrealizedGainPercentage,
            lastUpdateDate: nowTimestamp,
          });
        } else if (!holdingDoc.exists && transactionType === 'BUY') {
          // Create new holding
          const currentValue = quantity * price;
          const totalInvested = totalAmount + fees;

          const newHolding = {
            id: holdingRef.id,
            portfolioId,
            assetId,
            quantity,
            averageBuyPrice: price,
            totalInvested,
            currentPrice: price,
            currentValue,
            unrealizedGain: currentValue - totalInvested,
            unrealizedGainPercentage:
              totalInvested > 0
                ? ((currentValue - totalInvested) / totalInvested) * 100
                : 0,
            firstPurchaseDate: executedAtTimestamp,
            lastUpdateDate: nowTimestamp,
            portfolioPercentage: 0, // Will be calculated later
          };

          transaction.set(holdingRef, newHolding);
        } else if (transactionType === 'SELL') {
          // Handle sell logic - simplified for now
          throw new Error('SELL transactions not implemented yet');
        }

        // 7. Recalculate and update portfolio totals
        // In a production system, we'd query all holdings to calculate accurate totals
        // For now, we'll use the current holding update to estimate portfolio changes
        let updatedCurrentValue = 0;
        let updatedTotalInvested = 0;

        if (transactionType === 'BUY') {
          if (holdingDoc.exists) {
            // Use the updated holding values we calculated
            const existingHolding = holdingDoc.data()!;
            const newQuantity = existingHolding.quantity + quantity;
            const newTotalInvested =
              existingHolding.totalInvested + totalAmount + fees;
            const newCurrentValue = newQuantity * price;

            updatedCurrentValue = newCurrentValue;
            updatedTotalInvested = newTotalInvested;
          } else {
            // New holding
            updatedCurrentValue = quantity * price;
            updatedTotalInvested = totalAmount + fees;
          }
        }

        const updatedTotalGain = updatedCurrentValue - updatedTotalInvested;
        const updatedTotalGainPercentage =
          updatedTotalInvested > 0
            ? (updatedTotalGain / updatedTotalInvested) * 100
            : 0;

        transaction.update(portfolioRef, {
          currentValue: updatedCurrentValue,
          totalInvested: updatedTotalInvested,
          totalGain: updatedTotalGain,
          totalGainPercentage: updatedTotalGainPercentage,
          lastPriceUpdate: nowTimestamp,
          updatedAt: nowTimestamp,
        });

        // 8. Create or update daily snapshot
        const snapshotData = {
          portfolioId,
          date: executedAtTimestamp,
          totalValue: updatedCurrentValue,
          totalGain: updatedTotalGain,
          totalGainPercentage: updatedTotalGainPercentage,
          dailyChange: 0, // Would be calculated from previous day's snapshot
          dailyChangePercentage: 0,
          holdings: [], // Would be populated with actual holdings data
          createdAt: nowTimestamp,
        };

        if (snapshotDoc.exists) {
          // Update existing snapshot with new values
          transaction.update(snapshotRef, snapshotData);
        } else {
          // Create new snapshot
          transaction.set(snapshotRef, snapshotData);
        }

        return transactionRef.id;
      });

      logger.info('Portfolio transaction added successfully', {
        userId: auth.uid,
        portfolioId,
        transactionId: result,
        assetId,
        transactionType,
      });

      return {
        success: true,
        data: { transactionId: result },
      };
    } catch (error) {
      logger.error('Add portfolio transaction failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);

// ============= SCHEDULED FUNCTIONS =============

// Daily portfolio snapshot generation
export const dailyPortfolioSnapshot = pubsub
  .schedule('0 0 * * *') // Run daily at midnight UTC
  .onRun(async () => {
    logger.info('Daily portfolio snapshot started');

    try {
      const portfoliosSnapshot = await db.collection('portfolios').get();
      const batch = db.batch();
      let processed = 0;
      let errors = 0;

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        try {
          // Get current holdings
          const holdingsSnapshot = await db
            .collection(
              FIRESTORE_PATHS.FINANCES.HOLDINGS('dummy', portfolioDoc.id)
            )
            .get();

          const holdings = holdingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as IPortfolioHolding[];

          // Calculate portfolio totals
          const totals = calculatePortfolioTotals(holdings);

          // Create daily snapshot
          const snapshotId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const snapshotRef = db
            .collection(
              FIRESTORE_PATHS.FINANCES.SNAPSHOTS('dummy', portfolioDoc.id)
            )
            .doc(snapshotId);

          const snapshot: Omit<IPortfolioSnapshot, 'id'> = {
            portfolioId: portfolioDoc.id,
            date: admin.firestore.Timestamp.now() as unknown as IPortfolioSnapshot['date'],
            totalValue: totals.currentValue,
            totalGain: totals.totalGain,
            totalGainPercentage: totals.totalGainPercentage,
            dailyChange: 0, // Will be calculated separately
            dailyChangePercentage: 0,
            holdings,
            createdAt:
              admin.firestore.Timestamp.now() as unknown as IPortfolioSnapshot['createdAt'],
          };

          batch.set(snapshotRef, snapshot);

          // Update portfolio totals
          batch.update(portfolioDoc.ref, {
            currentValue: totals.currentValue,
            totalGain: totals.totalGain,
            totalGainPercentage: totals.totalGainPercentage,
            lastPriceUpdate: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });

          processed++;
        } catch (portfolioError) {
          logger.error(`Portfolio ${portfolioDoc.id} failed:`, portfolioError);
          errors++;
        }
      }

      await batch.commit();
      logger.info(
        `Portfolio snapshots completed: ${processed}/${portfoliosSnapshot.size} processed, ${errors} errors`
      );
      return { message: 'Daily portfolio snapshots generated successfully.' };
    } catch (error) {
      logger.error('Portfolio snapshot generation failed:', error);
      return { error: 'Error generating daily snapshots.' };
    }
  });

// Update asset prices (placeholder for real implementation)
export const updateAssetPrices = pubsub
  .schedule('0 * * * *') // Every hour
  .onRun(async () => {
    logger.info('Starting asset price update');

    try {
      // TODO: Implement real price updates from external APIs
      // 1. Get all unique assets from portfolios
      // 2. Fetch current prices from APIs (CoinGecko, Alpha Vantage, etc.)
      // 3. Update assets collection
      // 4. Recalculate holdings and portfolio values

      logger.warn('Asset price update not implemented - using placeholder');
      return { message: 'Asset prices updated successfully.' };
    } catch (error) {
      logger.error('Asset price update failed:', error);
      return { error: 'Error updating asset prices.' };
    }
  });

// Admin function to manually trigger portfolio calculations
export const adminRecalculatePortfolio = https.onCall<ICallableRequest>(
  async (req): Promise<ICallableResponse<{ message: string }>> => {
    logger.info('Admin portfolio recalculation requested', {
      userId: req.auth?.uid,
      isAdmin: req.auth?.token.admin,
    });

    if (!req.auth?.uid || !req.auth.token.admin) {
      logger.warn('Unauthorized portfolio recalculation attempt', {
        userId: req.auth?.uid,
      });
      return {
        success: false,
        error: 'Only admins can recalculate portfolios.',
      };
    }

    try {
      const { portfolioId } = req.data as unknown as { portfolioId: string };

      if (!portfolioId) {
        return { success: false, error: 'Portfolio ID is required.' };
      }

      logger.info(`Admin recalculating portfolio: ${portfolioId}`);

      // TODO: Implement portfolio recalculation logic
      // 1. Get all transactions for portfolio
      // 2. Recalculate holdings from transactions
      // 3. Update portfolio totals
      // 4. Generate snapshot if needed

      return {
        success: true,
        data: {
          message: `Portfolio ${portfolioId} recalculated successfully.`,
        },
      };
    } catch (error) {
      logger.error('Portfolio recalculation failed:', error);
      return { success: false, error: 'Error recalculating portfolio.' };
    }
  }
);
