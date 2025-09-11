import { FIRESTORE_PATHS } from '@shared/consts';
import {
  AddTransactionResult,
  AssetForTransaction,
  IAsset,
  IPortfolio,
  IPortfolioHolding,
  IPortfolioSnapshot,
  IPortfolioTransaction,
  IPriceData,
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

import { env } from '../../../core/config';
import { AppError } from '../../../core/errors';
import { db, now } from '../../../core/firebase';
import { log } from '../../../core/logger';
import { PolygonService } from '../../../services/polygon/polygon';
import { getUserData } from '../../auth/auth.service';

const polygonService = new PolygonService(env.POLYGON_API_KEY);

export async function updateSystemHoldings(
  correlationId: string
): Promise<IPortfolioHolding[]> {
  log.info('Updating system holdings', undefined, correlationId);

  try {
    const holdingsRef = db().collectionGroup('holdings');
    const snapshot = await holdingsRef.where('isSystemAsset', '==', true).get();

    const holdings = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id }) as IPortfolioHolding
    );
    log.info(
      'System holdings to update',
      { count: holdings.length },
      correlationId
    );

    const assetsToUpdate = await getSystemAssets();

    const holdingsToUpdate: IPortfolioHolding[] = [];
    for (const holding of holdings) {
      const asset = assetsToUpdate.find((a) => a.id === holding.assetId);
      if (!asset) {
        log.warn(
          'Asset for holding not found, skipping',
          { holdingId: holding.id, assetId: holding.assetId },
          correlationId
        );
        continue;
      }

      const holdingToUpdate = {
        ...holding,
        currentPrice: asset?.priceData?.price || holding.currentPrice,
        currentValue: asset?.priceData?.price || holding.currentPrice,
        updatedAt: new Date() as any,
      };
      holdingsToUpdate.push(holdingToUpdate);

      log.info(
        'Updating system holding',
        { holdingId: holding.id },
        correlationId
      );
      const holdingRef = db().doc(
        FIRESTORE_PATHS.FINANCES.HOLDING(
          holding.userId,
          holding.portfolioId,
          holding.id
        )
      );
      await holdingRef.update(holdingToUpdate);
    }

    log.info('System holdings update completed', undefined, correlationId);
    return holdingsToUpdate;
  } catch (error) {
    log.error('Failed to update system holdings', { error }, correlationId);
    throw new AppError(
      'system-holdings-update-failed',
      'Failed to update system holdings',
      500
    );
  }
}

export async function updateHoldings(
  assetsUpdated: IAsset[],
  correlationId: string
): Promise<IPortfolioHolding[]> {
  log.info('Updating holdings for updated assets', undefined, correlationId);

  if (assetsUpdated.length === 0) {
    log.info(
      'No assets were updated, skipping holdings update',
      undefined,
      correlationId
    );
    return [];
  }

  try {
    const holdingsRef = db().collectionGroup('holdings');
    const snapshot = await holdingsRef
      .where(
        'assetId',
        'in',
        assetsUpdated.map((a) => a.id)
      )
      .get();

    const holdings = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id }) as IPortfolioHolding
    );
    log.info('Holdings to update', { count: holdings.length }, correlationId);

    const holdingsToUpdate: IPortfolioHolding[] = [];
    for (const holding of holdings) {
      const asset = assetsUpdated.find((a) => a.id === holding.assetId);
      const holdingToUpdate = {
        ...holding,
        currentPrice: asset?.priceData?.price || holding.currentPrice,
        currentValue:
          (asset?.priceData?.price || holding.currentPrice) * holding.quantity,
        updatedAt: new Date() as any,
      };

      holdingsToUpdate.push(holdingToUpdate);

      log.info('Updating holding', { holdingId: holding.id }, correlationId);
      const holdingRef = db().doc(
        FIRESTORE_PATHS.FINANCES.HOLDING(
          holding.userId,
          holding.portfolioId,
          holding.id
        )
      );
      await holdingRef.update(holdingToUpdate);
    }

    log.info('Holdings update completed', undefined, correlationId);
    return holdingsToUpdate;
  } catch (error) {
    log.error('Failed to update holdings', { error }, correlationId);
    throw new AppError(
      'holdings-update-failed',
      'Failed to update holdings',
      500
    );
  }
}

export async function updateAssets(correlationId: string): Promise<IAsset[]> {
  log.info('Updating asset prices', undefined, correlationId);

  try {
    const assetsRef = db().collection(FIRESTORE_PATHS.ASSETS.ROOT());
    const snapshot = await assetsRef.where('isActive', '==', true).get();
    const assets = snapshot.docs.map((doc) => doc.data() as IAsset);
    const symbols = assets.map((a) => a.symbol);

    if (symbols.length === 0) {
      log.info('No active assets found to update', undefined, correlationId);
      return [];
    }

    const prices = await getWatchlistPrices(symbols, correlationId);

    const assetsToUpdate: IAsset[] = [];
    for (const priceData of prices) {
      const asset = assets.find((a) => a.symbol === priceData.symbol);
      if (asset && asset.priceData?.price !== priceData.price) {
        assetsToUpdate.push({
          ...asset,
          priceData,
        });
      }
    }

    log.info(
      'Assets to update',
      { count: assetsToUpdate.length },
      correlationId
    );

    if (assetsToUpdate.length > 0) {
      for (const asset of assetsToUpdate) {
        log.info('Updating asset price', { assetId: asset.id }, correlationId);
        const assetRef = db().doc(FIRESTORE_PATHS.ASSETS.ASSET(asset.id));
        await assetRef.update({ priceData: asset.priceData });
      }
    }

    log.info('Asset prices update completed', undefined, correlationId);
    return assetsToUpdate;
  } catch (error) {
    log.error('Failed to update asset prices', { error }, correlationId);
    throw new AppError(
      'asset-update-failed',
      'Failed to update asset prices',
      500
    );
  }
}

export async function updatePortfolioSnapshotsAndPortfolios(
  updatedHoldings: IPortfolioHolding[],
  correlationId: string
): Promise<boolean> {
  log.info('Updating portfolio snapshots', undefined, correlationId);

  try {
    const uniqueRecordsToUpdate = Array.from(
      new Set(updatedHoldings.map((h) => `${h.userId}::${h.portfolioId}`))
    );

    for (const x of uniqueRecordsToUpdate) {
      const [userId, portfolioId] = x.split('::');
      const holdingsRefs = db().collection(
        FIRESTORE_PATHS.FINANCES.HOLDINGS(userId, portfolioId)
      );
      const holdings = (await holdingsRefs.get()).docs.map(
        (doc) => doc.data() as IPortfolioHolding
      );

      const newSnapshot = generateSnapshot(portfolioId, holdings);
      const previousSnapshotRef = db().doc(
        FIRESTORE_PATHS.FINANCES.SNAPSHOT(
          userId,
          portfolioId,
          dayjs().subtract(1, 'day').format('YYYY-MM-DD')
        )
      );
      const previousSnapshot = (
        await previousSnapshotRef.get()
      ).data() as IPortfolioSnapshot;

      const portfolioRef = db().doc(
        FIRESTORE_PATHS.FINANCES.PORTFOLIO(userId, portfolioId)
      );
      const portfolioSnapshot = (await portfolioRef.get()).data() as IPortfolio;

      const {
        currentValue,
        dailyGain,
        dailyGainPercentage,
        totalGain,
        totalGainPercentage,
        totalInvested,
      } = calculatePortfolioTotals(previousSnapshot, newSnapshot);

      const updatedPortfolio: IPortfolio = {
        ...portfolioSnapshot,
        currentValue,
        dailyGain,
        dailyGainPercentage,
        totalGain,
        totalGainPercentage,
        totalInvested,
      };

      const snapshotRef = db().doc(
        FIRESTORE_PATHS.FINANCES.SNAPSHOT(userId, portfolioId, newSnapshot.id)
      );

      log.info(
        'Updating portfolio and snapshot',
        { userId, portfolioId },
        correlationId
      );

      const batch = db().batch();
      batch.set(snapshotRef, normalizeObjectDates(newSnapshot, toDate));
      batch.set(portfolioRef, updatedPortfolio);
      await batch.commit();
    }

    log.info(
      'Portfolio snapshots updated successfully',
      undefined,
      correlationId
    );
    return true;
  } catch (error) {
    log.error('Failed to update portfolio snapshots', { error }, correlationId);
    throw new AppError(
      'portfolio-snapshots-update-failed',
      'Failed to update portfolio snapshots',
      500
    );
  }
}

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
  query?: string,
  limit?: number
): Promise<IAsset[]> {
  try {
    log.info('Fetching system assets', { query, limit });
    const assetsRef = db().collection(FIRESTORE_PATHS.ASSETS.SYSTEM_ASSETS());

    let queryRef: FirebaseFirestore.Query = assetsRef.where(
      'isActive',
      '==',
      true
    );

    if (query && query.trim().length > 0) {
      const queryLower = query.trim().toLowerCase();
      queryRef = queryRef.where('searchKeywords', 'array-contains', queryLower);
    }

    if (typeof limit === 'number' && Number.isInteger(limit) && limit > 0) {
      queryRef = queryRef.limit(limit);
    }

    const snapshot = await queryRef.get();
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
    userId: userId,
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

export async function getWatchlistPrices(
  symbols: string[],
  correlationId?: string
): Promise<IPriceData[]> {
  try {
    log.info(
      'Getting watchlist prices',
      { symbols, count: symbols.length },
      correlationId
    );

    const priceUpdates = await polygonService.getBatchPriceUpdates(symbols);

    // Use mapper to convert Polygon price updates to internal format

    log.info(
      'Watchlist prices retrieved',
      {
        requestedCount: symbols.length,
        retrievedCount: priceUpdates.length,
      },
      correlationId
    );

    return priceUpdates;
  } catch (error) {
    log.error(
      'Failed to get watchlist prices',
      { symbols, error },
      correlationId
    );
    throw new AppError(
      'watchlist-prices-failed',
      'Failed to get watchlist prices',
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
