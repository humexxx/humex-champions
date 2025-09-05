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
    // Core finance functions (shared level)
    getAssetPrice: 'getAssetPriceCallable',
    getAssetDetails: 'getAssetDetailsCallable',
    getMarketData: 'getMarketDataCallable',
    searchTradableAssets: 'searchTradableAssetsCallable',
    refreshAssetPrices: 'refreshAssetPricesCallable',

    // Portfolio submodule
    portfolio: {
      updatePortfolioPrices: 'updatePortfolioPricesCallable',
      getWatchlistPrices: 'getWatchlistPricesCallable',
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

// Flattened version for easy access (auto-generated from the structure above)
export const CALLABLE_FUNCTION_NAMES = {
  // Admin
  addAdminClaim: CALLABLE_FUNCTIONS.admin.addAdminClaim,

  // Dashboard
  dashboardSummary: CALLABLE_FUNCTIONS.dashboard.summary,

  // Finances
  getAssetPrice: CALLABLE_FUNCTIONS.finances.getAssetPrice,
  getAssetDetails: CALLABLE_FUNCTIONS.finances.getAssetDetails,
  getMarketData: CALLABLE_FUNCTIONS.finances.getMarketData,
  searchTradableAssets: CALLABLE_FUNCTIONS.finances.searchTradableAssets,
  refreshAssetPrices: CALLABLE_FUNCTIONS.finances.refreshAssetPrices,
  updatePortfolioPrices:
    CALLABLE_FUNCTIONS.finances.portfolio.updatePortfolioPrices,
  getWatchlistPrices: CALLABLE_FUNCTIONS.finances.portfolio.getWatchlistPrices,
  adminGenerateSnapshots:
    CALLABLE_FUNCTIONS.finances.personalFinances.adminGenerateSnapshots,

  // Entertainment F1
  getF1DriverStandings:
    CALLABLE_FUNCTIONS.entertainment.sports.f1.getDriverStandings,
  getF1ConstructorStandings:
    CALLABLE_FUNCTIONS.entertainment.sports.f1.getConstructorStandings,
  getF1NextRace: CALLABLE_FUNCTIONS.entertainment.sports.f1.getNextRace,
  getF1Schedule: CALLABLE_FUNCTIONS.entertainment.sports.f1.getSchedule,
  getF1News: CALLABLE_FUNCTIONS.entertainment.sports.f1.getNews,
  getF1DriverInfo: CALLABLE_FUNCTIONS.entertainment.sports.f1.getDriverInfo,
  getF1DriverResults:
    CALLABLE_FUNCTIONS.entertainment.sports.f1.getDriverResults,
  getF1DriverStats: CALLABLE_FUNCTIONS.entertainment.sports.f1.getDriverStats,

  // Entertainment Soccer
  getSoccerStandings:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getStandings,
  getSoccerTeams: CALLABLE_FUNCTIONS.entertainment.sports.soccer.getTeams,
  getSoccerNextMatches:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getNextMatches,
  getSoccerPreviousMatches:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPreviousMatches,
  getSoccerCombinedMatches:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getCombinedMatches,
  getSoccerMatchesByDate:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getMatchesByDate,
  getSoccerTeamInfo: CALLABLE_FUNCTIONS.entertainment.sports.soccer.getTeamInfo,
  getSoccerPlayers: CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPlayers,
  getSoccerPlayerInfo:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPlayerInfo,
  searchSoccer: CALLABLE_FUNCTIONS.entertainment.sports.soccer.search,
  searchSoccerTeams: CALLABLE_FUNCTIONS.entertainment.sports.soccer.searchTeams,
  searchSoccerPlayers:
    CALLABLE_FUNCTIONS.entertainment.sports.soccer.searchPlayers,

  // Uplift
  getUpliftDailyStats: CALLABLE_FUNCTIONS.uplift.getDailyStats,
  getUpliftOverallStats: CALLABLE_FUNCTIONS.uplift.getOverallStats,
  adminChecklistReport: CALLABLE_FUNCTIONS.uplift.adminChecklistReport,
} as const;
