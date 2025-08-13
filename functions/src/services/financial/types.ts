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
  market: 'stocks' | 'crypto' | 'fx';
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
export interface StockPrice {
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

export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf';
  exchange?: string;
  currency: string;
  isActive: boolean;
  marketCap?: number;
  description?: string;
  logoUrl?: string;
  lastUpdated?: string;
}

export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  change: number;
  changePercent: number;
}
