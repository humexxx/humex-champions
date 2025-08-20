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

  // ============= THIRD PARTY / EXTERNAL APIS =============
  THIRD_PARTY: {
    F1: {
      ROOT: () => `third-party/f1`,

      // Standings cache (by year) - fixed to have even number of path segments
      DRIVER_STANDINGS: (year: number) =>
        `third-party/f1/standings/drivers-${year}`,
      CONSTRUCTOR_STANDINGS: (year: number) =>
        `third-party/f1/standings/constructors-${year}`,

      // Schedule cache (by year)
      SCHEDULE: (year: number) => `third-party/f1/schedules/year-${year}`,

      // News cache (time-based)
      NEWS: () => `third-party/f1/cache/news`,
      NEWS_ARTICLE: (articleId: string) => `third-party/f1/news/${articleId}`,

      // Driver data cache
      DRIVERS: () => `third-party/f1/cache/drivers`,
      DRIVER_INFO: (driverId: string) => `third-party/f1/drivers/${driverId}`,
      DRIVER_STATS: (driverId: string) =>
        `third-party/f1/driver-stats/${driverId}`,
      DRIVER_RESULTS: (driverId: string, year: number) =>
        `third-party/f1/driver-results/${driverId}-${year}`,
      DRIVER_PHOTOS: (driverId: string) =>
        `third-party/f1/driver-photos/${driverId}`,

      // Cache metadata
      CACHE_META: () => `third-party/f1/cache/metadata`,
      CACHE_META_ITEM: (key: string) => `third-party/f1/cache-meta/${key}`,
    },
  },

  // ============= ENTERTAINMENT FEATURE (Deprecated - use THIRD_PARTY.F1) =============
  ENTERTAINMENT: {
    F1: {
      ROOT: () => `entertainment/f1`,

      // Standings cache (by year)
      DRIVER_STANDINGS: (year: number) =>
        `entertainment/f1/standings/drivers/${year}`,
      CONSTRUCTOR_STANDINGS: (year: number) =>
        `entertainment/f1/standings/constructors/${year}`,

      // Schedule cache (by year)
      SCHEDULE: (year: number) => `entertainment/f1/schedule/${year}`,

      // News cache (time-based)
      NEWS: () => `entertainment/f1/news`,
      NEWS_ARTICLE: (articleId: string) => `entertainment/f1/news/${articleId}`,

      // Driver data cache
      DRIVERS: () => `entertainment/f1/drivers`,
      DRIVER_INFO: (driverId: string) =>
        `entertainment/f1/drivers/${driverId}/info`,
      DRIVER_STATS: (driverId: string) =>
        `entertainment/f1/drivers/${driverId}/stats`,
      DRIVER_RESULTS: (driverId: string, year: number) =>
        `entertainment/f1/drivers/${driverId}/results/${year}`,
      DRIVER_PHOTOS: (driverId: string) =>
        `entertainment/f1/drivers/${driverId}/photos`,

      // Cache metadata
      CACHE_META: () => `entertainment/f1/cache-metadata`,
      CACHE_META_ITEM: (key: string) =>
        `entertainment/f1/cache-metadata/${key}`,
    },
  },
};

export const CALLABLE_FUNCTIONS = {
  dashboard: {
    summary: 'dashboardSummary',
  },
  portfolio: {
    // Transaction functions
    addPortfolioTransaction: 'addPortfolioTransaction',

    // Calculation functions
    adminRecalculatePortfolio: 'adminRecalculatePortfolio',

    // Scheduled function admin triggers
    adminUpdateAssetPrices: 'adminUpdateAssetPrices',
    adminUpdatePortfolioSnapshots: 'adminUpdatePortfolioSnapshots',

    // Legacy functions (to be removed)
    createPortfolio: 'createPortfolio',
    updatePortfolio: 'updatePortfolio',
    deletePortfolio: 'deletePortfolio',
    addTransaction: 'addTransaction',
    updateAssetPrices: 'updateAssetPrices',
    createDailySnapshot: 'createDailySnapshot',
    calculateHoldings: 'calculateHoldings',
  },
  entertainment: {
    f1: {
      // Core data functions
      getDriverStandings: 'getF1DriverStandings',
      getConstructorStandings: 'getF1ConstructorStandings',
      getNextRace: 'getF1NextRace',
      getSchedule: 'getF1Schedule',
      getNews: 'getF1News',

      // Driver-specific functions
      getDriverInfo: 'getF1DriverInfo',
      getDriverRaceResults: 'getF1DriverRaceResults',
      getDriverStats: 'getF1DriverStats',

      // Scheduled functions
      updateDailyNews: 'updateF1DailyNews',
    },
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
