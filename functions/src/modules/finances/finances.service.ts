import { AssetFilterType } from '@shared/types/finances';
import { IAsset, IPriceData } from '@shared/types/finances/portfolio';

import { env } from '../../core/config';
import { AppError } from '../../core/errors';
import { log } from '../../core/logger';
import { PolygonService } from '../../services/polygon/polygon';
import { getSystemAssets } from './portafolio/portafolio.service';

const polygonService = new PolygonService(env.POLYGON_API_KEY);

export async function searchTradableAssets(
  query: string,
  type: AssetFilterType = 'all',
  limit = 20
): Promise<IAsset[]> {
  try {
    if (type === 'system') return getSystemAssets(query, limit);

    log.info('Searching tradable assets', { query, type, limit });

    const results = await polygonService.searchAssets(query, limit);

    log.info('Asset search completed', {
      query,
      type,
      limit,
      resultsCount: results.assets.length,
    });

    return results.assets;
  } catch (error) {
    log.error('Failed to search assets', { query, type, limit, error });
    throw new AppError('asset-search-failed', 'Failed to search assets', 500);
  }
}

export async function getAssetDetails(symbol: string): Promise<IAsset> {
  try {
    log.info('Getting asset details', { symbol });

    const asset = await polygonService.getAssetDetails(symbol);

    if (!asset) {
      throw new AppError('asset-not-found', `Asset ${symbol} not found`, 404);
    }

    log.info('Asset details retrieved', { symbol });

    return asset;
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

export async function getAssetPrice(symbol: string): Promise<IPriceData> {
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

    log.info('Asset price retrieved', { symbol, price: priceUpdates[0].price });
    return priceUpdates[0];
  } catch (error) {
    if (error instanceof AppError) throw error;

    log.error('Failed to get asset price', { symbol, error });
    throw new AppError('price-fetch-failed', 'Failed to get asset price', 500);
  }
}
