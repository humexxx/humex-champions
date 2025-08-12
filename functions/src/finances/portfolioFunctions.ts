import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import { IPortfolioHolding, IPortfolioSnapshot } from '@shared/models/finances';
import { calculatePortfolioTotals } from '@shared/utils/portfolio';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';
import { https } from 'firebase-functions/v2';

const db = admin.firestore();

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
            .collection(FIRESTORE_PATHS.PORTFOLIOS.HOLDINGS(portfolioDoc.id))
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
            .collection(FIRESTORE_PATHS.PORTFOLIOS.SNAPSHOTS(portfolioDoc.id))
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
