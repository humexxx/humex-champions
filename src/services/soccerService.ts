import { CALLABLE_FUNCTIONS } from '@shared/consts';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase Functions
const functions = getFunctions(undefined, 'us-central1');

/**
 * Soccer Service for Frontend
 * Provides typed interfaces to Soccer Firebase Functions using TheSportsDB API
 */
export class SoccerService {
  /**
   * Get league standings/table
   * @param leagueId - League ID (required)
   * @param season - Season (optional, defaults to current year)
   */
  static async getLeagueStandings(leagueId: string, season?: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getStandings
    );
    const result = await fn({ leagueId, season });
    return result.data;
  }

  /**
   * Get teams for a specific league
   * @param leagueName - League name (required, e.g., "English Premier League")
   */
  static async getLeagueTeams(leagueName: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getTeams
    );
    const result = await fn({ leagueName });
    return result.data;
  }

  /**
   * Get combined matches data (upcoming and past) optimized for rate limits
   * @param leagueId - League ID (required)
   */
  static async getCombinedMatches(leagueId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getCombinedMatches
    );
    const result = await fn({ leagueId });
    return result.data;
  }

  /**
   * Get next matches for a league
   * @param leagueId - League ID (required)
   */
  static async getNextMatches(leagueId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getNextMatches
    );
    const result = await fn({ leagueId });
    return result.data;
  }

  /**
   * Get previous matches for a league
   * @param leagueId - League ID (required)
   */
  static async getPreviousMatches(leagueId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPreviousMatches
    );
    const result = await fn({ leagueId });
    return result.data;
  }

  /**
   * Get matches for a specific date
   * @param date - Date in YYYY-MM-DD format (required)
   * @param sport - Sport filter (optional, defaults to "Soccer")
   */
  static async getMatchesByDate(date: string, sport?: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getMatchesByDate
    );
    const result = await fn({ date, sport });
    return result.data;
  }

  /**
   * Get team information
   * @param teamId - Team ID (required)
   */
  static async getTeamInfo(teamId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getTeamInfo
    );
    const result = await fn({ teamId });
    return result.data;
  }

  /**
   * Get team players
   * @param teamId - Team ID (required)
   */
  static async getTeamPlayers(teamId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPlayers
    );
    const result = await fn({ teamId });
    return result.data;
  }

  /**
   * Get player information
   * @param playerId - Player ID (required)
   */
  static async getPlayerInfo(playerId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.getPlayerInfo
    );
    const result = await fn({ playerId });
    return result.data;
  }

  /**
   * Search for teams by name
   * @param teamName - Team name to search for (required)
   */
  static async searchTeams(teamName: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.searchTeams
    );
    const result = await fn({ teamName });
    return result.data;
  }

  /**
   * Search for players by name
   * @param playerName - Player name to search for (required)
   */
  static async searchPlayers(playerName: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.sports.soccer.searchPlayers
    );
    const result = await fn({ playerName });
    return result.data;
  }

  /**
   * Get comprehensive soccer page data (for landing page)
   * This is a convenience method that fetches multiple data sources
   */
  static async getSoccerPageData(leagueId: string = '4328', season?: string) {
    try {
      // Default to Premier League if no league specified
      // Generate proper season format (YYYY-YYYY) for soccer leagues
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12

      // Soccer seasons typically run from August to May (e.g., "2025-2026")
      const seasonStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
      const defaultSeason = `${seasonStartYear}-${seasonStartYear + 1}`;

      const currentSeason = season || defaultSeason;

      // Fetch multiple data sources, using combined matches for efficiency
      const [standings, teams, combinedMatches] = await Promise.allSettled([
        this.getLeagueStandings(leagueId, currentSeason),
        this.getLeagueTeams('English Premier League'), // Default to Premier League
        this.getCombinedMatches(leagueId),
      ]);

      // Extract matches from combined response
      const combinedMatchesData =
        combinedMatches.status === 'fulfilled'
          ? (combinedMatches.value as any)
          : {
              success: false,
              data: {
                nextMatches: { data: [] },
                previousMatches: { data: [] },
              },
            };

      return {
        currentSeason,
        leagueId,
        standings:
          standings.status === 'fulfilled'
            ? standings.value
            : { success: false, data: [] },
        teams:
          teams.status === 'fulfilled'
            ? teams.value
            : { success: false, data: [] },
        nextMatches: combinedMatchesData.success
          ? combinedMatchesData.data.nextMatches
          : { success: false, data: [] },
        previousMatches: combinedMatchesData.success
          ? combinedMatchesData.data.previousMatches
          : { success: false, data: [] },
        apiCallsMade: combinedMatchesData.success
          ? combinedMatchesData.data.apiCallsMade
          : 0,
        cacheStatus: combinedMatchesData.success
          ? combinedMatchesData.data.cacheStatus
          : {},
      };
    } catch (error) {
      console.error('Error fetching soccer page data:', error);
      throw error;
    }
  }
}

// Export for convenient use
export default SoccerService;

// Type definitions for better TypeScript support
export interface SoccerServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SoccerPageData {
  currentSeason: string;
  leagueId: string;
  standings: SoccerServiceResponse<any[]>;
  teams: SoccerServiceResponse<any[]>;
  nextMatches: SoccerServiceResponse<any[]>;
  previousMatches: SoccerServiceResponse<any[]>;
  apiCallsMade?: number;
  cacheStatus?: {
    nextFromCache?: boolean;
    previousFromCache?: boolean;
  };
}

// Popular Soccer League IDs for easy access (from TheSportsDB)
export const POPULAR_SOCCER_LEAGUES = {
  PREMIER_LEAGUE: '4328', // English Premier League
  LA_LIGA: '4335', // Spanish La Liga
  BUNDESLIGA: '4331', // German Bundesliga
  SERIE_A: '4332', // Italian Serie A
  LIGUE_1: '4334', // French Ligue 1
  CHAMPIONS_LEAGUE: '4480', // UEFA Champions League
  EUROPA_LEAGUE: '4481', // UEFA Europa League
  WORLD_CUP: '4451', // FIFA World Cup
  EUROS: '4450', // UEFA European Championship
  COPA_AMERICA: '4452', // Copa America
  MLS: '4346', // Major League Soccer
  BRAZILIAN_SERIE_A: '4351', // Brazilian Serie A
  ARGENTINE_PRIMERA: '4350', // Argentine Primera División
} as const;
