import { AssetFilterType } from '@shared/types/finances';
import { IAsset } from '@shared/types/finances/portfolio';
import { FieldValue } from 'firebase-admin/firestore';

import { env } from '../../core/config';
import { AppError } from '../../core/errors';
import { db } from '../../core/firebase';
import { log } from '../../core/logger';
import { PolygonService } from '../../services/financial/polygon';
import {
  InternalPriceData,
  mapPolygonAssetToIAsset,
  mapPolygonAssetsToIAssets,
  mapPolygonPriceUpdatesToInternal,
} from '../../services/financial/polygon.mappers';

// Types
// Using InternalPriceData from mappers instead of local PriceData
type PriceData = InternalPriceData;

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

const polygonService = new PolygonService(env.POLYGON_API_KEY);

export async function searchTradableAssets(
  query: string,
  type: AssetFilterType = 'all',
  limit = 20
): Promise<IAsset[]> {
  try {
    log.info('Searching tradable assets', { query, type, limit });

    const results = await polygonService.searchAssets(query, limit);

    // Map Polygon assets to internal IAsset format using imported mapper
    const mappedAssets = mapPolygonAssetsToIAssets(results.assets);

    log.info('Asset search completed', {
      query,
      type,
      limit,
      resultsCount: mappedAssets.length,
    });

    return mappedAssets;
  } catch (error) {
    log.error('Failed to search assets', { query, type, limit, error });
    throw new AppError('asset-search-failed', 'Failed to search assets', 500);
  }
}

export async function getAssetDetails(symbol: string): Promise<IAsset> {
  try {
    log.info('Getting asset details', { symbol });

    const polygonAsset = await polygonService.getAssetDetails(symbol);

    if (!polygonAsset) {
      throw new AppError('asset-not-found', `Asset ${symbol} not found`, 404);
    }

    // Convert Polygon asset to internal format
    const internalAsset = mapPolygonAssetToIAsset(polygonAsset);

    log.info('Asset details retrieved', { symbol });
    return internalAsset;
  } catch (error) {
    if (error instanceof AppError) throw error;

    log.error('Failed to get asset details', { symbol, error });
    throw new AppError(
      'asset-details-failed',
      'Failed to get asset details',
      500
    );
  }
}

export async function getAssetPrice(symbol: string): Promise<PriceData> {
  try {
    log.info('Getting asset price', { symbol });

    const priceUpdates = await polygonService.getBatchPriceUpdates([symbol]);

    if (!priceUpdates || priceUpdates.length === 0) {
      throw new AppError(
        'price-not-found',
        `Price for ${symbol} not found`,
        404
      );
    }

    const priceUpdate = priceUpdates[0];
    const priceData: PriceData = mapPolygonPriceUpdatesToInternal([
      priceUpdate,
    ])[0];

    log.info('Asset price retrieved', { symbol, price: priceData.price });
    return priceData;
  } catch (error) {
    if (error instanceof AppError) throw error;

    log.error('Failed to get asset price', { symbol, error });
    throw new AppError('price-fetch-failed', 'Failed to get asset price', 500);
  }
}

export async function getWatchlistPrices(
  symbols: string[]
): Promise<PriceData[]> {
  try {
    log.info('Getting watchlist prices', { symbols, count: symbols.length });

    const priceUpdates = await polygonService.getBatchPriceUpdates(symbols);

    // Use mapper to convert Polygon price updates to internal format
    const priceData = mapPolygonPriceUpdatesToInternal(priceUpdates);

    log.info('Watchlist prices retrieved', {
      requestedCount: symbols.length,
      retrievedCount: priceData.length,
    });

    return priceData;
  } catch (error) {
    log.error('Failed to get watchlist prices', { symbols, error });
    throw new AppError(
      'watchlist-prices-failed',
      'Failed to get watchlist prices',
      500
    );
  }
}

export async function refreshAssetPrices(
  symbols: string[]
): Promise<PriceData[]> {
  try {
    log.info('Refreshing asset prices', { symbols, count: symbols.length });

    // Get fresh prices
    const priceData = await getWatchlistPrices(symbols);

    // Store in cache/database for future use
    const batch = db().batch();

    priceData.forEach((price) => {
      const priceRef = db().collection('market-data').doc(price.symbol);
      batch.set(
        priceRef,
        {
          ...price,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    log.info('Asset prices refreshed and cached', {
      count: priceData.length,
    });

    return priceData;
  } catch (error) {
    log.error('Failed to refresh asset prices', { symbols, error });
    throw new AppError(
      'refresh-prices-failed',
      'Failed to refresh asset prices',
      500
    );
  }
}

export async function updatePortfolioWithCurrentPrices(
  portfolioId: string,
  uid: string,
  forceRefresh = false
): Promise<{ updatedPositions: number; totalValue: number }> {
  try {
    log.info('Updating portfolio with current prices', {
      portfolioId,
      uid,
      forceRefresh,
    });

    // Get portfolio positions
    const portfolioRef = db()
      .collection('users')
      .doc(uid)
      .collection('portfolios')
      .doc(portfolioId);

    const portfolioDoc = await portfolioRef.get();

    if (!portfolioDoc.exists) {
      throw new AppError('portfolio-not-found', 'Portfolio not found', 404);
    }

    const portfolio = portfolioDoc.data();
    const positions: PortfolioPosition[] = portfolio?.positions || [];

    if (positions.length === 0) {
      log.info('No positions to update', { portfolioId, uid });
      return { updatedPositions: 0, totalValue: 0 };
    }

    // Get symbols from positions
    const symbols = positions.map((p) => p.symbol);

    // Get current prices
    const priceData = forceRefresh
      ? await refreshAssetPrices(symbols)
      : await getWatchlistPrices(symbols);

    // Create price lookup map
    const priceMap = new Map(priceData.map((p) => [p.symbol, p]));

    // Update positions with current prices
    let totalValue = 0;
    let updatedPositions = 0;

    const updatedPositionsList = positions.map((position) => {
      const currentPrice = priceMap.get(position.symbol);

      if (currentPrice) {
        const currentValue = position.shares * currentPrice.price;
        const costBasis = position.shares * position.avgPrice;
        const pnl = currentValue - costBasis;
        const pnlPercent = (pnl / costBasis) * 100;

        totalValue += currentValue;
        updatedPositions++;

        return {
          ...position,
          currentPrice: currentPrice.price,
          currentValue,
          pnl,
          pnlPercent,
          lastPriceUpdate: FieldValue.serverTimestamp(),
        };
      }

      return position;
    });

    // Update portfolio document
    await portfolioRef.update({
      positions: updatedPositionsList,
      totalValue,
      lastPriceUpdate: FieldValue.serverTimestamp(),
    });

    log.info('Portfolio updated with current prices', {
      portfolioId,
      uid,
      updatedPositions,
      totalValue,
    });

    return { updatedPositions, totalValue };
  } catch (error) {
    if (error instanceof AppError) throw error;

    log.error('Failed to update portfolio with current prices', {
      portfolioId,
      uid,
      error,
    });
    throw new AppError(
      'portfolio-update-failed',
      'Failed to update portfolio with current prices',
      500
    );
  }
}
