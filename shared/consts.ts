export const FIRESTORE_PATHS = {
  USERS: (uid: string) => `users/${uid}`,
  FINANCES: {
    FINANCIAL_PLANS: (uid: string) => `finances/${uid}/financial-plans`,
    PORTFOLIO: (uid: string) => `finances/${uid}/portfolio`,
  },
  PORTFOLIOS: {
    ROOT: (portfolioId: string) => `portfolios/${portfolioId}`,
    HOLDINGS: (portfolioId: string) => `portfolios/${portfolioId}/holdings`,
    HOLDING: (portfolioId: string, assetId: string) =>
      `portfolios/${portfolioId}/holdings/${assetId}`,
    TRANSACTIONS: (portfolioId: string) =>
      `portfolios/${portfolioId}/transactions`,
    TRANSACTION: (portfolioId: string, transactionId: string) =>
      `portfolios/${portfolioId}/transactions/${transactionId}`,
    SNAPSHOTS: (portfolioId: string) => `portfolios/${portfolioId}/snapshots`,
    SNAPSHOT: (portfolioId: string, date: string) =>
      `portfolios/${portfolioId}/snapshots/${date}`,
  },
  ASSETS: {
    ROOT: () => `assets`,
    ASSET: (assetId: string) => `assets/${assetId}`,
  },
  USER_PORTFOLIOS: {
    ROOT: (uid: string) => `users/${uid}/portfolios`,
    PORTFOLIO: (uid: string, portfolioId: string) =>
      `users/${uid}/portfolios/${portfolioId}`,
  },
  UPLIFT: {
    INDEX: (uid: string) => `uplift/${uid}`,
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
    CHECKLIST: (uid: string) => `uplift/${uid}/checklist`,
  },
};

export const CALLABLE_FUNCTIONS = {
  dashboard: {
    summary: 'dashboardSummary',
  },
  portfolio: {
    createPortfolio: 'createPortfolio',
    updatePortfolio: 'updatePortfolio',
    deletePortfolio: 'deletePortfolio',
    addTransaction: 'addTransaction',
    updateAssetPrices: 'updateAssetPrices',
    createDailySnapshot: 'createDailySnapshot',
    calculateHoldings: 'calculateHoldings',
  },
};

export const PORTFOLIO_CONSTANTS = {
  DEFAULT_CURRENCY: 'USD',
  MAX_PORTFOLIOS_PER_USER: 10,
  TRANSACTION_TYPES: {
    BUY: 'BUY',
    SELL: 'SELL',
    DIVIDEND: 'DIVIDEND',
    SPLIT: 'SPLIT',
    TRANSFER_IN: 'TRANSFER_IN',
    TRANSFER_OUT: 'TRANSFER_OUT',
  },
  ASSET_CATEGORIES: {
    CRYPTO: 'CRYPTO',
    STOCK: 'STOCK',
    ETF: 'ETF',
    COMMODITY: 'COMMODITY',
    FOREX: 'FOREX',
  },
  ASSET_TYPES: {
    CRYPTOCURRENCY: 'CRYPTOCURRENCY',
    EQUITY: 'EQUITY',
    INDEX_FUND: 'INDEX_FUND',
    PRECIOUS_METAL: 'PRECIOUS_METAL',
    CURRENCY_PAIR: 'CURRENCY_PAIR',
  },
  PRICE_UPDATE_SCHEDULE: {
    MORNING_UTC: '06:00',
    EVENING_UTC: '22:00',
  },
  SNAPSHOT_DATE_FORMAT: 'YYYY-MM-DD',
} as const;
