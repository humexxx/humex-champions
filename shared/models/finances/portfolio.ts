import { IInstrument } from '../instruments';

// ============= PORTFOLIO MODELS =============

export interface IPortfolio<Timestamp = Date> {
  id: string;
  userId: string;
  name: string;
  isDraft: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyGain: number;
  dailyGainPercentage: number;
  totalInvested: number;

  currency: string;
  isDefault?: boolean;
  lastPriceUpdate?: Timestamp;
}

export interface IPortfolioSnapshot<Timestamp = Date> {
  id: string;
  portfolioId: string;
  date: Timestamp;

  totalValue: number;
  totalGain: number;
  totalGainPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;

  holdings: IPortfolioHolding[];
  createdAt: Timestamp;
}

// ============= HOLDINGS (POSICIONES ACTUALES) =============

export interface IPortfolioHolding<Timestamp = Date> {
  id: string;
  portfolioId: string;
  assetId: string;

  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;

  currentPrice: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;

  firstPurchaseDate: Timestamp;
  lastUpdateDate: Timestamp;
  portfolioPercentage: number;
}

// ============= ASSET MODELS =============

export interface IAsset<Timestamp = Date> {
  id: string;
  symbol: string;
  name: string;

  category: AssetCategory;
  type: AssetType;

  currentPrice: number;
  dayOpenPrice: number;
  dayClosePrice?: number;
  previousDayClose: number;

  dailyChange: number;
  dailyChangePercentage: number;

  currency: string;
  exchange?: string;
  lastPriceUpdate: Timestamp;

  marketCap?: number;
  volume24h?: number;
  sector?: string;
  industry?: string;
}

export type AssetCategory = 'CRYPTO' | 'STOCK' | 'ETF' | 'COMMODITY' | 'FOREX';
export type AssetType =
  | 'CRYPTOCURRENCY'
  | 'EQUITY'
  | 'INDEX_FUND'
  | 'PRECIOUS_METAL'
  | 'CURRENCY_PAIR';

// ============= ORDER/TRANSACTION MODELS =============

export interface IPortfolioTransaction<Timestamp = Date> {
  id: string;
  portfolioId: string;
  assetId: string;

  type: TransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;

  executedAt: Timestamp;
  createdAt: Timestamp;

  notes?: string;
  source?: string;
}

export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'DIVIDEND'
  | 'SPLIT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface IUserInstrument extends IInstrument {
  positionPercentage: number;
}

// ============= FIREBASE COLLECTION STRUCTURE =============

/*
FIRESTORE STRUCTURE:

/portfolios/{portfolioId} - IPortfolio
/portfolios/{portfolioId}/holdings/{assetId} - IPortfolioHolding  
/portfolios/{portfolioId}/transactions/{transactionId} - IPortfolioTransaction
/portfolios/{portfolioId}/snapshots/{YYYY-MM-DD} - IPortfolioSnapshot
/assets/{assetId} - IAsset (global)
/users/{userId}/portfolios/{portfolioId} - { id, name, isDefault, updatedAt }

FIRESTORE OPTIMIZATIONS:
- Holdings calculated on-the-fly from transactions
- Snapshots use date as ID (YYYY-MM-DD) for efficient time-range queries  
- Assets are global to reduce duplication
- User portfolio references are lightweight
- Precalculated totals in main portfolio document
- Composite indexes: portfolioId + executedAt for transaction queries
*/
