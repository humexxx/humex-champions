import { IAsset } from '@shared/types/finances';

import { log } from '../../core/logger';
import { ApiClientFactory } from '../_core/clientFactory';
import { HttpClient } from '../_core/httpClient';
import {
  mapPolygonAssetsToIAssets,
  mapPolygonAssetToIAsset,
  mapPolygonPriceUpdateToInternal,
} from './polygon.mappers';
import {
  AssetPrice,
  AssetSearchResult,
  PolygonAggResponse,
  PolygonTickerDetailsResponse,
  PolygonTickersResponse,
} from './types';

/**
 * Polygon.io API Client - Complete Portfolio Integration
 *
 * Enterprise-grade client for Polygon.io financial data API.
 * Optimized for portfolio management applications with comprehensive
 * features for asset discovery, price tracking, and batch operations.
 *
 * ## Key Features:
 * - Complete asset search and discovery (stocks, ETFs, crypto)
 * - Batch price updates optimized for portfolio tracking
 * - Real-time and historical market data
 * - Enterprise HTTP client with retry logic and rate limiting
 * - Native Firebase Functions integration
 * - TypeScript-first with comprehensive type safety
 *
 * ## Usage Examples:
 * ```typescript
 * const polygon = new PolygonService(apiKey);
 *
 * // Asset discovery for trading
 * const assets = await polygon.searchAssets('tesla', 20);
 * const popularStocks = await polygon.getPopularStocks(100);
 *
 * // Portfolio price updates
 * const prices = await polygon.getBatchPriceUpdates(['AAPL', 'BTC', 'ETH']);
 *
 * // Detailed asset information
 * const details = await polygon.getAssetDetails('AAPL');
 * ```
 */
export class PolygonService {
  private client: HttpClient;
  private apiKey: string;

  constructor(apiKey: string) {
    this.client = ApiClientFactory.createPolygonClient();
    this.apiKey = apiKey;
  }

  private buildUrl(
    endpoint: string,
    params: Record<string, string> = {}
  ): string {
    const searchParams = new URLSearchParams({
      ...params,
      apikey: this.apiKey,
    });

    return `${endpoint}?${searchParams.toString()}`;
  }

  // ==========================================
  // 1. ASSET SEARCH FOR ORDERS
  // ==========================================

  /**
   * Searches all types of available assets (stocks, crypto, ETFs)
   * For users to create orders
   * @param {string} query - Search query string
   * @param {number} limit - Maximum number of results to return
   * @return {Promise<AssetSearchResult>} Search results with assets and pagination info
   */
  async searchAssets(query: string, limit = 20): Promise<AssetSearchResult> {
    const endpoint = this.buildUrl('/v3/reference/tickers', {
      search: query,
      active: 'true',
      limit: limit.toString(),
      sort: 'ticker',
    });

    const response = await this.client.get<PolygonTickersResponse>(endpoint);
    const assets = mapPolygonAssetsToIAssets(response.data.results);

    return {
      assets,
      total: response.data.count,
      hasMore: !!response.data.next_url,
      nextCursor: response.data.next_url,
    };
  }

  /**
   * Gets all popular stocks
   * @param {number} limit - Maximum number of stocks to return
   * @return {Promise<Asset[]>} Array of popular stock assets
   */
  async getPopularStocks(limit = 100): Promise<IAsset[]> {
    const endpoint = this.buildUrl('/v3/reference/tickers', {
      type: 'CS', // Common Stock
      market: 'stocks',
      active: 'true',
      limit: limit.toString(),
      sort: 'market_cap',
      order: 'desc',
    });

    const response = await this.client.get<PolygonTickersResponse>(endpoint);
    const assets = mapPolygonAssetsToIAssets(response.data.results);

    return assets;
  }

  /**
   * Gets all available ETFs
   * @param {number} limit - Maximum number of ETFs to return
   * @return {Promise<Asset[]>} Array of ETF assets
   */
  async getETFs(limit = 100): Promise<IAsset[]> {
    const endpoint = this.buildUrl('/v3/reference/tickers', {
      type: 'ETF',
      market: 'stocks',
      active: 'true',
      limit: limit.toString(),
    });

    const response = await this.client.get<PolygonTickersResponse>(endpoint);
    const assets = mapPolygonAssetsToIAssets(response.data.results);

    return assets;
  }

  /**
   * Gets the most popular cryptocurrencies
   */
  async getPopularCryptos(): Promise<IAsset[]> {
    // Main cryptocurrencies - Polygon has limited free crypto access
    const popularCryptos = [
      'BTC',
      'ETH',
      'ADA',
      'SOL',
      'DOT',
      'MATIC',
      'AVAX',
      'LINK',
    ];

    const endpoint = this.buildUrl('/v3/reference/tickers', {
      market: 'crypto',
      active: 'true',
      limit: '50',
    });

    const response = await this.client.get<PolygonTickersResponse>(endpoint);
    const assets = mapPolygonAssetsToIAssets(response.data.results);

    return assets.filter((asset) => popularCryptos.includes(asset.symbol));
  }

  // ==========================================
  // 2. WATCHLIST ASSET PRICES
  // ==========================================

  /**
   * Gets prices for multiple stocks in watchlist
   * @param {string[]} symbols - Array of stock symbols
   * @return {Promise<IAsset[]>} Array of stock price data
   */
  async getAssetPrices(symbols: string[]): Promise<IAsset[]> {
    const promises = symbols.map((symbol) => this.getAssetPrice(symbol));
    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<IAsset> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Gets price for an individual stock
   * @param {string} symbol - Stock symbol (e.g., 'AAPL')
   * @return {Promise<IAsset>} Stock price data with OHLCV and change info
   */
  async getAssetPrice(symbol: string): Promise<IAsset> {
    const endpoint = this.buildUrl(`/v2/aggs/ticker/${symbol}/prev`);
    const response = await this.client.get<PolygonAggResponse>(endpoint);

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const result = response.data.results[0];
    const change = result.c - result.o;
    const changePercent = (change / result.o) * 100;

    const AssetPrice: AssetPrice = {
      symbol: symbol,
      price: result.c,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v,
      change,
      changePercent,
      timestamp: result.t,
    };

    return mapPolygonPriceUpdateToInternal(AssetPrice);
  }

  /**
   * Gets prices for multiple cryptocurrencies
   * @param {string[]} symbols - Array of crypto symbols
   * @return {Promise<CryptoPrice[]>} Array of cryptocurrency price data
   */
  async getCryptoPrices(symbols: string[]): Promise<IAsset[]> {
    const promises = symbols.map((symbol) => this.getCryptoPrice(symbol));
    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<IAsset> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Gets price for an individual cryptocurrency
   * @param {string} symbol - Crypto symbol (e.g., 'BTC')
   * @param {string} to - Target currency (default: 'USD')
   * @return {Promise<CryptoPrice>} Cryptocurrency price data with change info
   */
  async getCryptoPrice(symbol: string, to = 'USD'): Promise<IAsset> {
    const endpoint = this.buildUrl(`/v2/aggs/ticker/X:${symbol}${to}/prev`);
    const response = await this.client.get<PolygonAggResponse>(endpoint);

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`No data found for pair: ${symbol}/${to}`);
    }

    const result = response.data.results[0];
    const change = result.c - result.o;
    const changePercent = (change / result.o) * 100;

    const AssetPrice: AssetPrice = {
      symbol: symbol,
      price: result.c,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v,
      change,
      changePercent,
      timestamp: result.t,
    };

    return mapPolygonPriceUpdateToInternal(AssetPrice);
  }

  // ==========================================
  // 3. DETAILED ASSET DATA
  // ==========================================

  /**
   * Gets detailed information for an asset
   * @param {string} symbol - Asset symbol to get details for
   * @return {Promise<Asset>} Detailed asset information including market cap and description
   */
  async getAssetDetails(symbol: string): Promise<IAsset> {
    const endpoint = this.buildUrl(`/v3/reference/tickers/${symbol}`);
    const response =
      await this.client.get<PolygonTickerDetailsResponse>(endpoint);

    const data = response.data.results;
    log.info('Asset details retrieved', { data });
    const asset = mapPolygonAssetToIAsset(data);

    return asset;
  }

  // ==========================================
  // 4. BATCH UPDATES FOR FIRESTORE
  // ==========================================

  /**
   * Gets price updates for multiple assets
   * Optimized for batch updates in Firestore
   * @param {string[]} symbols - Array of asset symbols to get price updates for
   * @return {Promise<PriceUpdate[]>} Array of price update objects ready for Firestore
   */
  async getBatchPriceUpdates(symbols: string[]): Promise<IAsset[]> {
    const stockSymbols = symbols.filter((s) => !s.includes('/'));
    const cryptoSymbols = symbols.filter((s) => s.includes('/'));

    const [assetPrices, cryptoPrices] = await Promise.all([
      this.getAssetPrices(stockSymbols),
      this.getCryptoPrices(cryptoSymbols.map((s) => s.split('/')[0])),
    ]);

    return [...assetPrices, ...cryptoPrices];
  }

  // ==========================================
  // 5. UTILITIES
  // ==========================================

  /**
   * Verifies if the API key works
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getAssetPrice('AAPL');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the API status
   */
  async getApiStatus(): Promise<{ status: string; message?: string }> {
    try {
      const endpoint = this.buildUrl('/v2/aggs/ticker/AAPL/prev', {
        limit: '1',
      });
      await this.client.get(endpoint);
      return { status: 'operational' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
