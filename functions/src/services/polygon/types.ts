import { IAsset } from '@shared/types/finances';

// Polygon.io API Response Types
export interface PolygonAggResponse {
  results: Array<{
    c: number; // close price
    h: number; // high
    l: number; // low
    o: number; // open
    t: number; // timestamp
    v: number; // volume
  }>;
  status: string;
  count: number;
}

// Reference Data API responses
export interface PolygonTickersResponse {
  status: string;
  results: PolygonTicker[];
  count: number;
  next_url?: string;
}

export interface PolygonTicker {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange?: string;
  type: string;
  active: boolean;
  currency_name?: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  last_updated_utc?: string;
}

export interface PolygonTickerDetailsResponse {
  status: string;
  results: {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    active: boolean;
    currency_name: string;
    market_cap?: number;
    description?: string;
    homepage_url?: string;
    total_employees?: number;
    branding?: {
      logo_url?: string;
      icon_url?: string;
    };
    share_class_shares_outstanding?: number;
  };
}

// Our clean response types for the app
export interface AssetPrice {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface CryptoPrice {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: number;
  from: string;
  to: string;
}

export interface AssetSearchResult {
  assets: IAsset[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
