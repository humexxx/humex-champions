import { FIRESTORE_PATHS } from '@shared/consts';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * Soccer Cache Service
 * Manages caching of soccer data in Firestore to reduce API calls to TheSportsDB
 * Uses lower TTLs than F1 due to higher request limits
 */
export class SoccerCacheService {
  private db: Firestore;

  constructor() {
    this.db = getFirestore();
  }

  /**
   * Cache configuration for different data types
   * Lower TTLs than F1 due to more dynamic nature and higher API limits
   */
  private readonly CACHE_CONFIG = {
    STANDINGS: { ttl: 2 * 60 * 60 * 1000 }, // 2 hours (standings change frequently)
    TEAMS: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours (team info rarely changes)
    PLAYERS: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (player info changes seasonally)
    MATCHES_NEXT: { ttl: 30 * 60 * 1000 }, // 30 minutes (match schedules can change)
    MATCHES_PREVIOUS: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours (past matches are final)
    MATCHES_SEASON: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours (season data)
    MATCHES_DATE: { ttl: 60 * 60 * 1000 }, // 1 hour (daily matches)
    LEAGUE_INFO: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (league info rarely changes)
    LEAGUE_SEASONS: { ttl: 30 * 24 * 60 * 60 * 1000 }, // 30 days (seasons list)
    PLAYER_INFO: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (player details)
    TEAM_INFO: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours (team details)
    TEAM_PLAYERS: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours (team rosters can change)
  };

  /**
   * Recursively removes undefined values from objects and arrays
   * Firestore doesn't support undefined values, so we need to sanitize data
   * @param {unknown} obj Object to sanitize
   * @return {unknown} Sanitized object without undefined values
   */
  private sanitizeForFirestore(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeForFirestore(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          sanitized[key] = this.sanitizeForFirestore(value);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Generic cache getter with TTL check
   * @param {string} path Firestore document path
   * @param {string} cacheType Type of cache for TTL configuration
   * @return {Promise<T | null>} Cached data or null if expired/missing
   */
  private async getCachedData<T>(
    path: string,
    cacheType: keyof typeof this.CACHE_CONFIG
  ): Promise<T | null> {
    try {
      const doc = await this.db.doc(path).get();

      if (!doc.exists) {
        logger.debug(`Cache miss: No document found at ${path}`);
        return null;
      }

      const data = doc.data();
      if (!data) {
        logger.debug(`Cache miss: No data found at ${path}`);
        return null;
      }

      const { payload, cachedAt } = data;
      const ttl = this.CACHE_CONFIG[cacheType].ttl;
      const isExpired = Date.now() - cachedAt.toMillis() > ttl;

      if (isExpired) {
        logger.debug(`Cache expired for ${path}`);
        return null;
      }

      logger.debug(`Cache hit for ${path}`);
      return payload as T;
    } catch (error) {
      logger.error(`Error reading cache at ${path}:`, error);
      return null;
    }
  }

  /**
   * Generic cache setter
   * @param {string} path Firestore document path
   * @param {unknown} data Data to cache
   * @param {Object} metadata Additional metadata about the cache entry
   * @return {Promise<void>} Promise that resolves when data is cached
   */
  private async setCachedData<T>(
    path: string,
    data: T,
    metadata: { source: string; apiCalled: boolean } = {
      source: 'api',
      apiCalled: true,
    }
  ): Promise<void> {
    try {
      // Sanitize data to remove undefined values before storing in Firestore
      const sanitizedData = this.sanitizeForFirestore(data);

      await this.db.doc(path).set({
        payload: sanitizedData,
        cachedAt: new Date(),
        metadata,
      });

      logger.info(`Data cached at ${path}`, {
        source: metadata.source,
        apiCalled: metadata.apiCalled,
      });
    } catch (error) {
      logger.error(`Error caching data at ${path}:`, error);
    }
  }

  // ============= STANDINGS CACHE =============

  /**
   * Get cached league standings
   * @param {string} leagueId League ID
   * @param {string} season Season string
   * @return {Promise<unknown[] | null>} Cached standings or null
   */
  async getStandings(
    leagueId: string,
    season: string
  ): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.STANDINGS(leagueId, season);
    return this.getCachedData<unknown[]>(path, 'STANDINGS');
  }

  /**
   * Cache league standings
   * @param {string} leagueId League ID
   * @param {string} season Season string
   * @param {unknown[]} data Standings data
   * @return {Promise<void>}
   */
  async setStandings(
    leagueId: string,
    season: string,
    data: unknown[]
  ): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.STANDINGS(leagueId, season);
    await this.setCachedData(path, data);
  }

  // ============= TEAMS CACHE =============

  /**
   * Get cached league teams
   * @param {string} leagueId League ID
   * @return {Promise<unknown[] | null>} Cached teams or null
   */
  async getLeagueTeams(leagueId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAMS(leagueId);
    return this.getCachedData<unknown[]>(path, 'TEAMS');
  }

  /**
   * Cache league teams
   * @param {string} leagueId League ID
   * @param {unknown[]} data Teams data
   * @return {Promise<void>}
   */
  async setLeagueTeams(leagueId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAMS(leagueId);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached team info
   * @param {string} teamId Team ID
   * @return {Promise<unknown | null>} Cached team info or null
   */
  async getTeamInfo(teamId: string): Promise<unknown | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAM_INFO(teamId);
    return this.getCachedData<unknown>(path, 'TEAM_INFO');
  }

  /**
   * Cache team info
   * @param {string} teamId Team ID
   * @param {unknown} data Team data
   * @return {Promise<void>}
   */
  async setTeamInfo(teamId: string, data: unknown): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAM_INFO(teamId);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached team players
   * @param {string} teamId Team ID
   * @return {Promise<unknown[] | null>} Cached players or null
   */
  async getTeamPlayers(teamId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAM_PLAYERS(teamId);
    return this.getCachedData<unknown[]>(path, 'TEAM_PLAYERS');
  }

  /**
   * Cache team players
   * @param {string} teamId Team ID
   * @param {unknown[]} data Players data
   * @return {Promise<void>}
   */
  async setTeamPlayers(teamId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.TEAM_PLAYERS(teamId);
    await this.setCachedData(path, data);
  }

  // ============= MATCHES CACHE =============

  /**
   * Get cached next matches for league
   * @param {string} leagueId League ID
   * @return {Promise<unknown[] | null>} Cached matches or null
   */
  async getNextMatches(leagueId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_NEXT(leagueId);
    return this.getCachedData<unknown[]>(path, 'MATCHES_NEXT');
  }

  /**
   * Cache next matches for league
   * @param {string} leagueId League ID
   * @param {unknown[]} data Matches data
   * @return {Promise<void>}
   */
  async setNextMatches(leagueId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_NEXT(leagueId);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached previous matches for league
   * @param {string} leagueId League ID
   * @return {Promise<unknown[] | null>} Cached matches or null
   */
  async getPreviousMatches(leagueId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_PREVIOUS(leagueId);
    return this.getCachedData<unknown[]>(path, 'MATCHES_PREVIOUS');
  }

  /**
   * Cache previous matches for league
   * @param {string} leagueId League ID
   * @param {unknown[]} data Matches data
   * @return {Promise<void>}
   */
  async setPreviousMatches(leagueId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_PREVIOUS(leagueId);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached matches by date
   * @param {string} date Date string (YYYY-MM-DD)
   * @return {Promise<unknown[] | null>} Cached matches or null
   */
  async getMatchesByDate(date: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_DATE(date);
    return this.getCachedData<unknown[]>(path, 'MATCHES_DATE');
  }

  /**
   * Cache matches by date
   * @param {string} date Date string (YYYY-MM-DD)
   * @param {unknown[]} data Matches data
   * @return {Promise<void>}
   */
  async setMatchesByDate(date: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_DATE(date);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached season matches
   * @param {string} leagueId League ID
   * @param {string} season Season string
   * @return {Promise<unknown[] | null>} Cached matches or null
   */
  async getSeasonMatches(
    leagueId: string,
    season: string
  ): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_SEASON(
      leagueId,
      season
    );
    return this.getCachedData<unknown[]>(path, 'MATCHES_SEASON');
  }

  /**
   * Cache season matches
   * @param {string} leagueId League ID
   * @param {string} season Season string
   * @param {unknown[]} data Matches data
   * @return {Promise<void>}
   */
  async setSeasonMatches(
    leagueId: string,
    season: string,
    data: unknown[]
  ): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.MATCHES_SEASON(
      leagueId,
      season
    );
    await this.setCachedData(path, data);
  }

  // ============= LEAGUE CACHE =============

  /**
   * Get cached league info
   * @param {string} leagueId League ID
   * @return {Promise<unknown | null>} Cached league info or null
   */
  async getLeagueInfo(leagueId: string): Promise<unknown | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.LEAGUE_INFO(leagueId);
    return this.getCachedData<unknown>(path, 'LEAGUE_INFO');
  }

  /**
   * Cache league info
   * @param {string} leagueId League ID
   * @param {unknown} data League data
   * @return {Promise<void>}
   */
  async setLeagueInfo(leagueId: string, data: unknown): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.LEAGUE_INFO(leagueId);
    await this.setCachedData(path, data);
  }

  /**
   * Get cached league seasons
   * @param {string} leagueId League ID
   * @return {Promise<unknown[] | null>} Cached seasons or null
   */
  async getLeagueSeasons(leagueId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.LEAGUE_SEASONS(leagueId);
    return this.getCachedData<unknown[]>(path, 'LEAGUE_SEASONS');
  }

  /**
   * Cache league seasons
   * @param {string} leagueId League ID
   * @param {unknown[]} data Seasons data
   * @return {Promise<void>}
   */
  async setLeagueSeasons(leagueId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.LEAGUE_SEASONS(leagueId);
    await this.setCachedData(path, data);
  }

  // ============= PLAYER CACHE =============

  /**
   * Get cached player info
   * @param {string} playerId Player ID
   * @return {Promise<unknown | null>} Cached player info or null
   */
  async getPlayerInfo(playerId: string): Promise<unknown | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.PLAYER_INFO(playerId);
    return this.getCachedData<unknown>(path, 'PLAYER_INFO');
  }

  /**
   * Cache player info
   * @param {string} playerId Player ID
   * @param {unknown} data Player data
   * @return {Promise<void>}
   */
  async setPlayerInfo(playerId: string, data: unknown): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.SOCCER.PLAYER_INFO(playerId);
    await this.setCachedData(path, data);
  }

  // ============= UTILITY FUNCTIONS =============

  /**
   * Log API usage for monitoring
   * @param {string} endpoint API endpoint
   * @param {string} functionName Function name
   * @param {boolean} cached Whether data was served from cache
   * @return {void}
   */
  logApiCall(endpoint: string, functionName: string, cached: boolean): void {
    logger.warn(`🔴 TheSportsDB API called: ${functionName}`, {
      endpoint,
      cached,
      cost: cached ? 'CACHE_HIT' : 'API_REQUEST',
      severity: 'WARNING',
      message: `🔴 TheSportsDB API called: ${functionName}`,
    });
  }
}

export default SoccerCacheService;
