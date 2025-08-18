export const FIRESTORE_PATHS = {
  // ============= USER ROOT =============
  USERS: (uid: string) => `users/${uid}`,

  // ============= FINANCES FEATURE (User-Centric - Private Data) =============
  FINANCES: {
    // Personal finance planning (private, complex calculations)
    FINANCIAL_PLANS: (uid: string) => `finances/${uid}/financial-plans`,

    // Portfolio data (private, user-specific)
    PORTFOLIOS: (uid: string) => `finances/${uid}/portfolios`,
    PORTFOLIO: (uid: string, portfolioId: string) =>
      `finances/${uid}/portfolios/${portfolioId}`,
    HOLDINGS: (uid: string, portfolioId: string) =>
      `finances/${uid}/portfolios/${portfolioId}/holdings`,
    HOLDING: (uid: string, portfolioId: string, assetId: string) =>
      `finances/${uid}/portfolios/${portfolioId}/holdings/${assetId}`,
    TRANSACTIONS: (uid: string, portfolioId: string) =>
      `finances/${uid}/portfolios/${portfolioId}/transactions`,
    TRANSACTION: (uid: string, portfolioId: string, transactionId: string) =>
      `finances/${uid}/portfolios/${portfolioId}/transactions/${transactionId}`,
    SNAPSHOTS: (uid: string, portfolioId: string) =>
      `finances/${uid}/portfolios/${portfolioId}/snapshots`,
    SNAPSHOT: (uid: string, portfolioId: string, date: string) =>
      `finances/${uid}/portfolios/${portfolioId}/snapshots/${date}`,

    // Trading journal (private trading data)
    TRADING_JOURNAL: (uid: string) => `finances/${uid}/trading-journal`,
  },

  // ============= UPLIFT FEATURE (User-Centric) =============
  UPLIFT: {
    INDEX: (uid: string) => `uplift/${uid}`,
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
    CHECKLIST: (uid: string) => `uplift/${uid}/checklist`,
    CALENDAR: (uid: string) => `uplift/${uid}/calendar`,
    GOALS: (uid: string) => `uplift/${uid}/goals`,
  },

  // ============= SHARED/GLOBAL DATA =============
  ASSETS: {
    ROOT: () => `assets`,
    ASSET: (assetId: string) => `assets/${assetId}`,
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
    addPortfolioTransaction: 'addPortfolioTransaction',
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
