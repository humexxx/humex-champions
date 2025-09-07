import { IAsset } from '@shared/types/finances/portfolio';
import dayjs from 'dayjs';

import { AssetPrice, PolygonTicker } from './types';

/**
 * Mappers to convert Polygon API types to internal application types
 * This ensures Polygon-specific types don't propagate throughout the app
 */

export function mapPolygonAssetToIAsset(ticker: PolygonTicker): IAsset {
  return {
    id: ticker.ticker, // Using symbol as ID for now
    symbol: ticker.ticker,
    name: ticker.name,
    market: ticker.market as any,
    exchange: ticker.primary_exchange,
    currency: ticker.currency_name || 'USD',
    isActive: ticker.active,
    isSystemAsset: false, // Defaulting to false; can be set based on app logic
    lastPriceUpdate: dayjs(ticker.last_updated_utc),
  };
}

export function mapPolygonAssetsToIAssets(tickers: PolygonTicker[]): IAsset[] {
  return tickers.map(mapPolygonAssetToIAsset);
}

export function mapPolygonPriceUpdateToInternal(
  priceUpdate: AssetPrice
): IAsset {
  return {
    id: priceUpdate.symbol,
    symbol: priceUpdate.symbol,
    price: priceUpdate.price,
    change: priceUpdate.change || 0,
    changePercent: priceUpdate.changePercent || 0,
    open: priceUpdate.open,
    high: priceUpdate.high,
    low: priceUpdate.low,
    close: priceUpdate.close,
    volume: priceUpdate.volume,
    lastPriceUpdate: dayjs(priceUpdate.timestamp),
    isActive: true, // Assuming active if we have a price update
    market: 'stocks', // Defaulting to stocks; can be adjusted based on app logic
  };
}

export function mapPolygonPriceUpdatesToInternal(
  priceUpdates: AssetPrice[]
): IAsset[] {
  return priceUpdates.map(mapPolygonPriceUpdateToInternal);
}
