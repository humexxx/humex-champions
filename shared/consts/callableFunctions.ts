/**
 * CALLABLE_FUNCTIONS - Firebase Functions Names
 *
 * This file contains the mapping of all callable functions in the Firebase Functions project.
 * When adding a new callable function, update this file accordingly.
 *
 * Structure follows the modular architecture defined in functions/src/modules/
 *
 * Last Updated: 2025-09-05
 * Auto-generated based on functions/src/modules structure
 */

export const CALLABLE_FUNCTIONS = {
  // ============= ADMIN MODULE =============
  admin: {
    addAdminClaim: 'addAdminClaimCallable',
  },

  // ============= DASHBOARD MODULE =============
  dashboard: {
    summary: 'dashboardSummaryCallable',
  },

  // ============= FINANCES MODULE =============
  finances: {
    // Portfolio submodule
    portfolio: {
      addTransaction: 'addTransactionCallable',
      approveTransaction: 'approveTransactionCallable',
      getAssetPrice: 'getAssetPriceCallable',
      getAssetDetails: 'getAssetDetailsCallable',
      getMarketData: 'getMarketDataCallable',
      searchTradableAssets: 'searchTradableAssetsCallable',
      refreshAssetPrices: 'refreshAssetPricesCallable',
      updatePortfolioPrices: 'updatePortfolioPricesCallable',
      getWatchlistPrices: 'getWatchlistPricesCallable',

      // Admin callable functions for portfolio schedulers
      updatePortfolios: 'updatePortfoliosSchedulerCallable',
      updatePortfoliosWithSystemHoldings:
        'updatePortfoliosWithSystemHoldingsSchedulerCallable',
    },

    // Personal Finances submodule
    personalFinances: {
      adminGenerateSnapshots: 'adminGenerateSnapshotsCallable',
    },
  },

  // ============= ENTERTAINMENT MODULE =============
  entertainment: {
    // Sports parent module with F1 and Soccer submodules
    sports: {
      // F1 submodule
      f1: {
        // Core data functions
        getDriverStandings: 'getF1StandingsCallable', // Note: This is getF1Standings in the file
        getConstructorStandings: 'getF1ConstructorStandingsCallable',
        getNextRace: 'getF1NextRaceCallable',
        getSchedule: 'getF1ScheduleCallable',
        getNews: 'getF1NewsCallable',

        // Driver-specific functions
        getDriverInfo: 'getF1DriverInfoCallable',
        getDriverResults: 'getF1DriverResultsCallable',
        getDriverStats: 'getF1DriverStatsCallable',
      },

      // Soccer submodule
      soccer: {
        // Core data functions
        getStandings: 'getSoccerStandingsCallable',
        getTeams: 'getSoccerTeamsCallable',
        getNextMatches: 'getSoccerNextMatchesCallable',
        getPreviousMatches: 'getSoccerPreviousMatchesCallable',
        getCombinedMatches: 'getSoccerCombinedMatchesCallable',
        getMatchesByDate: 'getSoccerMatchesByDateCallable',

        // Team-specific functions
        getTeamInfo: 'getSoccerTeamInfoCallable',

        // Player-specific functions
        getPlayers: 'getSoccerPlayersCallable',
        getPlayerInfo: 'getSoccerPlayerInfoCallable',

        // Search functions
        search: 'searchSoccerCallable',
        searchTeams: 'searchSoccerTeamsCallable',
        searchPlayers: 'searchSoccerPlayersCallable',
      },
    },
  },

  // ============= UPLIFT MODULE =============
  uplift: {
    // Statistics functions
    getDailyStats: 'getUpliftDailyStats',
    getOverallStats: 'getUpliftOverallStats',

    // Admin functions
    adminChecklistReport: 'adminChecklistReport',
  },
} as const;

// Type helpers for better TypeScript support
export type CallableFunctionPaths = {
  readonly [K in keyof typeof CALLABLE_FUNCTIONS]: (typeof CALLABLE_FUNCTIONS)[K];
};
