import { FIRESTORE_PATHS } from '@shared/consts';
import {
  AddTransactionResult,
  AssetForTransaction,
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
  IPortfolioTransaction,
  TransactionFormData,
} from '@shared/types/finances/portfolio';
import { normalizeObjectDates, toDate } from '@shared/utils';
import {
  calculatePortfolioTotals,
  calculateTotalInvestedFromHoldings,
  calculateTotalValueFromHoldings,
  createAssetId,
} from '@shared/utils/portfolio';
import dayjs from 'dayjs';

import { AppError } from '../../../core/errors';
import { db, now } from '../../../core/firebase';
import { log } from '../../../core/logger';
import { getUserData } from '../../auth/auth.service';

export async function addAsset(asset: IAsset): Promise<void> {
  log.info('Adding new asset', { asset });
  try {
    const assetRef = db().doc(FIRESTORE_PATHS.ASSETS.ASSET(asset.id));
    await assetRef.set(asset);
  } catch (error) {
    log.error('Failed to add asset', { asset, error });
    throw new AppError('asset-add-failed', 'Failed to add asset', 500);
  }
}

export async function getSystemAssets(
  query: string,
  limit: number
): Promise<IAsset[]> {
  try {
    log.info('Fetching system assets', { query, limit });
    const assetsRef = db().collection(FIRESTORE_PATHS.ASSETS.SYSTEM_ASSETS());

    let queryRef = assetsRef.where('isActive', '==', true);

    if (query && query.trim().length > 0) {
      const queryLower = query.trim().toLowerCase();
      queryRef = queryRef.where('searchKeywords', 'array-contains', queryLower);
    }

    const snapshot = await queryRef.limit(limit).get();
    const assets = snapshot.docs.map((doc) => doc.data() as IAsset);
    log.info('System assets fetched', { count: assets.length });
    return assets;
  } catch (error) {
    log.error('Failed to fetch system assets', { query, limit, error });
    throw new AppError(
      'system-assets-fetch-failed',
      'Failed to fetch system assets',
      500
    );
  }
}

export async function addTransaction(
  userId: string,
  transactionData: TransactionFormData,
  asset: AssetForTransaction
): Promise<AddTransactionResult> {
  const firestore = db();
  const batch = firestore.batch();
  const assetId = createAssetId(asset.symbol, asset.exchange);

  // Step 1: Handle asset creation/update (outside batch if needed)
  const assetRef = firestore.doc(FIRESTORE_PATHS.ASSETS.ASSET(assetId));
  const assetSnapshot = await assetRef.get();

  if (!assetSnapshot.exists && !asset.isSystemAsset) {
    // Create new asset (can be done outside batch)
    const newAsset: IAsset = {
      id: assetId,
      ...(asset as any),
    };

    await assetRef.set(newAsset);
  }

  // Step 2: Read all necessary documents within batch context
  const portfolioRef = firestore.doc(
    FIRESTORE_PATHS.FINANCES.PORTFOLIO(userId, transactionData.portfolioId)
  );

  const previousSnapshotRef = firestore.doc(
    FIRESTORE_PATHS.FINANCES.SNAPSHOT(
      userId,
      transactionData.portfolioId,
      dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    )
  );
  const snapshotRef = firestore.doc(
    FIRESTORE_PATHS.FINANCES.SNAPSHOT(
      userId,
      transactionData.portfolioId,
      dayjs().format('YYYY-MM-DD')
    )
  );

  const holdingCollectionRef = firestore.collection(
    FIRESTORE_PATHS.FINANCES.HOLDINGS(userId, transactionData.portfolioId)
  );
  const holdingRef = holdingCollectionRef.doc();
  const transactionRef = firestore
    .collection(
      FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, transactionData.portfolioId)
    )
    .doc();

  const [portfolioSnapshot, previousSnapshot, holdings] = await Promise.all([
    portfolioRef.get(),
    previousSnapshotRef.get(),
    holdingCollectionRef.get(),
  ]);

  const userData = await getUserData(userId);

  // Step 3: Create the transaction
  const transaction: IPortfolioTransaction = {
    id: transactionRef.id,
    portfolioId: transactionData.portfolioId,
    assetId: assetId,
    type: transactionData.type,
    quantity: transactionData.quantity,
    purchasePrice: transactionData.price,
    totalAmount: transactionData.price * transactionData.quantity,
    fees: 0, // Default fees to 0 for now
    executedAt: now() as any, // Firestore server timestamp
    notes: transactionData.notes,

    userId: userId,
    username: userData.fullName,
    holdingId: holdingRef.id,
    isSystemAsset: asset.isSystemAsset || false,
    systemFlags: asset.isSystemAsset
      ? {
          status: 'pending',
        }
      : undefined,
  };

  const holding: IPortfolioHolding = {
    id: holdingRef.id,
    portfolioId: transactionData.portfolioId,
    assetId: assetId,

    quantity: transactionData.quantity,
    totalInvested: transactionData.price * transactionData.quantity,

    currentPrice: transactionData.price,
    currentValue: transactionData.price * transactionData.quantity,

    createdAt: now() as any,
    updatedAt: now() as any,

    isSystemAsset: asset.isSystemAsset || false,
    status: asset.isSystemAsset ? 'pending' : 'active',
  };

  const newSnapshot = normalizeObjectDates<IPortfolioSnapshot>(
    generateSnapshot(
      transactionData.portfolioId,
      holdings.docs
        .map((doc) => doc.data() as IPortfolioHolding)
        .concat([holding])
    ),
    toDate
  );

  batch.set(transactionRef, transaction);
  batch.set(holdingRef, holding);
  batch.set(snapshotRef, newSnapshot);

  const {
    currentValue,
    dailyGain,
    dailyGainPercentage,
    totalGain,
    totalGainPercentage,
    totalInvested,
  } = calculatePortfolioTotals(
    previousSnapshot.data() as IPortfolioSnapshot,
    newSnapshot
  );

  const updatedPortfolio: IPortfolio = {
    ...(portfolioSnapshot.data() as IPortfolio),
    currentValue,
    dailyGain,
    dailyGainPercentage,
    totalGain,
    totalGainPercentage,
    totalInvested,
  };

  batch.set(transactionRef, transaction);
  batch.set(holdingRef, holding);
  batch.set(snapshotRef, newSnapshot);
  batch.set(portfolioRef, updatedPortfolio);

  // Commit all changes at once
  await batch.commit();

  return {
    transactionId: transactionRef.id,
    assetId,
  };
}

export async function approveTransaction(
  userId: string,
  portfolioId: string,
  transactionId: string,
  approvedByUserId: string
): Promise<boolean> {
  log.info('Approving transaction', {
    userId,
    portfolioId,
    transactionId,
    approvedByUserId,
  });

  try {
    const firestore = db();

    // Step 1: Create references for batch operation
    const transactionRef = firestore
      .collection(FIRESTORE_PATHS.FINANCES.TRANSACTIONS(userId, portfolioId))
      .doc(transactionId);

    // Step 2: Read all required documents first (before any writes)
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      throw new AppError('transaction-not-found', 'Transaction not found', 404);
    }

    const transaction = transactionDoc.data() as IPortfolioTransaction;

    // Step 3: Validate business rules
    if (!transaction.isSystemAsset) {
      throw new AppError(
        'invalid-transaction-type',
        'Only system asset transactions can be approved through this function',
        400
      );
    }

    if (transaction.systemFlags?.status !== 'pending') {
      throw new AppError(
        'invalid-transaction-status',
        'Transaction is not in pending status',
        400
      );
    }

    // Step 4: Get holding document
    const holdingRef = firestore
      .collection(FIRESTORE_PATHS.FINANCES.HOLDINGS(userId, portfolioId))
      .doc(transaction.holdingId);

    const holdingDoc = await holdingRef.get();

    if (!holdingDoc.exists) {
      throw new AppError(
        'holding-not-found',
        'Portfolio holding not found',
        404
      );
    }

    const holding = holdingDoc.data() as IPortfolioHolding;

    // Step 5: Validate holding status
    if (holding.status !== 'pending') {
      throw new AppError(
        'invalid-holding-status',
        'Holding is not in pending status',
        400
      );
    }

    const adminUser = await getUserData(approvedByUserId);

    if (!adminUser) {
      throw new AppError(
        'admin-user-not-found',
        'Admin user approving the transaction was not found',
        404
      );
    }

    // Step 7: Create batch and execute all updates atomically
    const batch = firestore.batch();

    // Update transaction with approval
    batch.update(transactionRef, {
      'systemFlags.status': 'approved',
      'systemFlags.approvedAt': now(),
      'systemFlags.approvedBy': adminUser.fullName,
      'systemFlags.approvedByUserId': approvedByUserId,
      updatedAt: now(),
    });

    // Update holding status to active
    batch.update(holdingRef, {
      status: 'active',
      updatedAt: now(),
    });

    // Commit all changes atomically
    await batch.commit();

    log.info('Transaction approved successfully', {
      transactionId,
      holdingId: holding.id,
      approvedByUserId,
    });

    return true;
  } catch (error) {
    log.error('Failed to approve transaction', {
      userId,
      portfolioId,
      transactionId,
      approvedByUserId,
      error,
    });

    // Re-throw AppErrors as-is, wrap unknown errors
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'transaction-approval-failed',
      'Failed to approve transaction: ' + (error as Error).message,
      500
    );
  }
}

function generateSnapshot(
  portfolioId: string,
  holdings: IPortfolioHolding[]
): IPortfolioSnapshot {
  const now = dayjs();
  return {
    id: new Date().toISOString().split('T')[0],
    portfolioId,
    createdAt: now,
    updatedAt: now,
    holdings,

    totalInvested: calculateTotalInvestedFromHoldings(holdings),
    totalValue: calculateTotalValueFromHoldings(holdings),
  };
}
