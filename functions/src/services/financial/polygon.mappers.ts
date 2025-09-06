import { IAsset } from '@shared/types/finances/portfolio';
import dayjs from 'dayjs';

import { Asset as PolygonAsset, PriceUpdate } from './types';

/**
 * Mappers to convert Polygon API types to internal application types
 * This ensures Polygon-specific types don't propagate throughout the app
 */

/**
 * Maps a Polygon Asset to internal IAsset format
 * @param {PolygonAsset} polygonAsset - The Polygon asset to map
 * @return {IAsset} Mapped IAsset for internal use
 */
export function mapPolygonAssetToIAsset(polygonAsset: PolygonAsset): IAsset {
  return {
    id: polygonAsset.symbol, // Using symbol as ID for now
    symbol: polygonAsset.symbol,
    name: polygonAsset.name,
    category:
      polygonAsset.type === 'stock'
        ? 'STOCK'
        : polygonAsset.type === 'crypto'
          ? 'CRYPTO'
          : polygonAsset.type === 'etf'
            ? 'ETF'
            : 'STOCK',
    type: polygonAsset.type,

    currentPrice: 0, // Will be updated with price data
    dayOpenPrice: 0,
    previousDayClose: 0,
    dailyChange: 0,
    dailyChangePercentage: 0,

    currency: polygonAsset.currency || 'USD',
    exchange: polygonAsset.exchange,
    lastPriceUpdate: dayjs(), // Using dayjs for proper Dayjs type

    marketCap: polygonAsset.marketCap,
    sector: undefined, // Polygon doesn't provide this in basic search
    industry: undefined, // Polygon doesn't provide this in basic search
  };
}

/**
 * Maps an array of Polygon Assets to internal IAsset format
 * @param {PolygonAsset[]} polygonAssets - Array of Polygon assets to map
 * @return {IAsset[]} Array of mapped IAssets for internal use
 */
export function mapPolygonAssetsToIAssets(
  polygonAssets: PolygonAsset[]
): IAsset[] {
  return polygonAssets.map(mapPolygonAssetToIAsset);
}

/**
 * Maps Polygon PriceUpdate to a simplified price data structure
 * Note: This could also be mapped to a more specific internal type if needed
 */
export interface InternalPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

/**
 * Maps Polygon PriceUpdate to internal price data format
 * @param {PriceUpdate} priceUpdate - The Polygon price update to map
 * @return {InternalPriceData} Mapped price data for internal use
 */
export function mapPolygonPriceUpdateToInternal(
  priceUpdate: PriceUpdate
): InternalPriceData {
  return {
    symbol: priceUpdate.symbol,
    price: priceUpdate.price,
    change: priceUpdate.change || 0,
    changePercent: priceUpdate.changePercent || 0,
    timestamp: Date.now(),
  };
}

/**
 * Maps an array of Polygon PriceUpdates to internal format
 * @param {PriceUpdate[]} priceUpdates - Array of Polygon price updates to map
 * @return {InternalPriceData[]} Array of mapped price data for internal use
 */
export function mapPolygonPriceUpdatesToInternal(
  priceUpdates: PriceUpdate[]
): InternalPriceData[] {
  return priceUpdates.map(mapPolygonPriceUpdateToInternal);
}
