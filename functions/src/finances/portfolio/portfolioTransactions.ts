import { FIRESTORE_PATHS } from '@shared/consts';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { onCall } from 'firebase-functions/v2/https';

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
 * Add Portfolio Transaction - Handles transaction creation, holding updates, portfolio totals
 */
export const addPortfolioTransaction = onCall<ICallableRequest>(
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
          throw new Error('Portfolio not found');
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
        // Get the snapshot document (just to verify it exists)
        await transaction.get(snapshotRef);

        // ====== ALL WRITES AFTER ======

        // 5. Create/Update asset in global collection
        if (!assetDoc.exists) {
          transaction.set(assetRef, {
            id: assetId,
            symbol: symbol,
            name: name,
            type: assetType,
            category: category,
            currentPrice: price,
            lastPriceUpdate: nowTimestamp,
            createdAt: nowTimestamp,
            updatedAt: nowTimestamp,
          });
        }

        // 6. Add transaction
        const transactionRef = db
          .collection(
            FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId)
          )
          .doc();

        transaction.set(transactionRef, {
          portfolioId: portfolioId,
          assetId: assetId,
          type: transactionType,
          quantity: quantity,
          price: price,
          totalAmount: totalAmount,
          fees: fees,
          executedAt: executedAtTimestamp,
          notes: notes,
          createdAt: nowTimestamp,
        });

        // 7. Update or create holding
        const currentHolding = holdingDoc.exists ? holdingDoc.data() : null;

        if (transactionType === 'BUY') {
          const newQuantity = (currentHolding?.quantity || 0) + quantity;
          const newTotalInvested =
            (currentHolding?.totalInvested || 0) + totalAmount;
          const newAverageBuyPrice = newTotalInvested / newQuantity;

          transaction.set(
            holdingRef,
            {
              portfolioId: portfolioId,
              assetId: assetId,
              quantity: newQuantity,
              averageBuyPrice: newAverageBuyPrice,
              totalInvested: newTotalInvested,
              currentPrice: price,
              currentValue: newQuantity * price,
              unrealizedGain: newQuantity * price - newTotalInvested,
              unrealizedGainPercentage:
                ((newQuantity * price - newTotalInvested) / newTotalInvested) *
                100,
              firstPurchaseDate:
                currentHolding?.firstPurchaseDate || executedAtTimestamp,
              lastUpdateDate: nowTimestamp,
            },
            { merge: true }
          );
        } else if (transactionType === 'SELL') {
          if (!currentHolding || currentHolding.quantity < quantity) {
            throw new Error('Insufficient holdings to sell');
          }

          const newQuantity = currentHolding.quantity - quantity;
          if (newQuantity === 0) {
            transaction.delete(holdingRef);
          } else {
            const newTotalInvested =
              currentHolding.totalInvested *
              (newQuantity / currentHolding.quantity);
            transaction.update(holdingRef, {
              quantity: newQuantity,
              totalInvested: newTotalInvested,
              currentValue: newQuantity * price,
              unrealizedGain: newQuantity * price - newTotalInvested,
              unrealizedGainPercentage:
                ((newQuantity * price - newTotalInvested) / newTotalInvested) *
                100,
              lastUpdateDate: nowTimestamp,
            });
          }
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
