import { AppError } from '../../../../core/errors';
import { log } from '../../../../core/logger';
import { SoccerCacheService } from '../../../../services/entertainment/soccerCache';
import { TheSportsDBClient } from '../../../../services/entertainment/theSportsDB';

// Initialize clients
const soccerClient = new TheSportsDBClient();
const soccerCache = new SoccerCacheService();

/**
 * Get soccer league standings
 * @param {string} leagueId - League identifier
 * @param {string} [season] - Season in format YYYY-YYYY
 */
export async function getSoccerStandings(
  leagueId: string,
  season?: string
): Promise<unknown> {
  try {
    log.info('Getting soccer standings', { leagueId, season });

    // Check cache first
    const cachedData = await soccerCache.getStandings(
      leagueId,
      season || '2024-2025'
    );
    if (cachedData) {
      soccerCache.logApiCall(
        `/standings/${leagueId}?season=${season}`,
        'getStandings',
        true
      );
      log.info('Soccer standings retrieved from cache', { leagueId, season });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(
      `/standings/${leagueId}?season=${season}`,
      'getStandings',
      false
    );
    const standings = await soccerClient.getLeagueStandings(leagueId, season);

    // Store in cache
    await soccerCache.setStandings(
      leagueId,
      season || '2024-2025',
      standings.table || []
    );

    log.info('Soccer standings retrieved from API and cached', {
      leagueId,
      season,
    });
    return standings;
  } catch (error) {
    log.error('Failed to get soccer standings', { leagueId, season, error });
    throw new AppError(
      'soccer-standings-failed',
      'Failed to get soccer standings',
      500,
      { leagueId, season }
    );
  }
}

/**
 * Get soccer league teams
 * @param {string} leagueName - League name (not ID for this API)
 */
export async function getSoccerTeams(leagueName: string): Promise<unknown> {
  try {
    log.info('Getting soccer teams', { leagueName });

    // Check cache first
    const cachedData = await soccerCache.getLeagueTeams(leagueName);
    if (cachedData) {
      soccerCache.logApiCall(`/teams/${leagueName}`, 'getLeagueTeams', true);
      log.info('Soccer teams retrieved from cache', { leagueName });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(`/teams/${leagueName}`, 'getLeagueTeams', false);
    const teams = await soccerClient.getLeagueTeams(leagueName);

    // Store in cache
    await soccerCache.setLeagueTeams(leagueName, teams.teams || []);

    log.info('Soccer teams retrieved from API and cached', {
      leagueName,
    });
    return teams;
  } catch (error) {
    log.error('Failed to get soccer teams', { leagueName, error });
    throw new AppError(
      'soccer-teams-failed',
      'Failed to get soccer teams',
      500,
      { leagueName }
    );
  }
}

/**
 * Get team information
 * @param {string} teamId - Team identifier
 */
export async function getSoccerTeamInfo(teamId: string): Promise<unknown> {
  try {
    log.info('Getting soccer team info', { teamId });

    // Check cache first
    const cachedData = await soccerCache.getTeamInfo(teamId);
    if (cachedData) {
      soccerCache.logApiCall(`/team/${teamId}`, 'getTeamInfo', true);
      log.info('Soccer team info retrieved from cache', { teamId });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(`/team/${teamId}`, 'getTeamInfo', false);
    const teamInfo = await soccerClient.getTeamInfo(teamId);

    // Store in cache
    await soccerCache.setTeamInfo(teamId, teamInfo.teams?.[0] || {});

    log.info('Soccer team info retrieved from API and cached', {
      teamId,
    });
    return teamInfo;
  } catch (error) {
    log.error('Failed to get soccer team info', { teamId, error });
    throw new AppError(
      'soccer-team-info-failed',
      'Failed to get soccer team info',
      500,
      { teamId }
    );
  }
}

/**
 * Get team players
 * @param {string} teamId - Team identifier
 */
export async function getSoccerPlayers(teamId: string): Promise<unknown> {
  try {
    log.info('Getting soccer players', { teamId });

    // Check cache first
    const cachedData = await soccerCache.getTeamPlayers(teamId);
    if (cachedData) {
      soccerCache.logApiCall(`/players/${teamId}`, 'getTeamPlayers', true);
      log.info('Soccer players retrieved from cache', { teamId });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(`/players/${teamId}`, 'getTeamPlayers', false);
    const players = await soccerClient.getTeamPlayers(teamId);

    // Store in cache
    await soccerCache.setTeamPlayers(teamId, players.player || []);

    log.info('Soccer players retrieved from API and cached', {
      teamId,
    });
    return players;
  } catch (error) {
    log.error('Failed to get soccer players', { teamId, error });
    throw new AppError(
      'soccer-players-failed',
      'Failed to get soccer players',
      500,
      { teamId }
    );
  }
}

/**
 * Get player information
 * @param {string} playerId - Player identifier
 */
export async function getSoccerPlayerInfo(playerId: string): Promise<unknown> {
  try {
    log.info('Getting soccer player info', { playerId });

    // Check cache first
    const cachedData = await soccerCache.getPlayerInfo(playerId);
    if (cachedData) {
      soccerCache.logApiCall(`/player/${playerId}`, 'getPlayerInfo', true);
      log.info('Soccer player info retrieved from cache', { playerId });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(`/player/${playerId}`, 'getPlayerInfo', false);
    const playerInfo = await soccerClient.getPlayerInfo(playerId);

    // Store in cache
    await soccerCache.setPlayerInfo(playerId, playerInfo.player?.[0] || {});

    log.info('Soccer player info retrieved from API and cached', {
      playerId,
    });
    return playerInfo;
  } catch (error) {
    log.error('Failed to get soccer player info', { playerId, error });
    throw new AppError(
      'soccer-player-info-failed',
      'Failed to get soccer player info',
      500,
      { playerId }
    );
  }
}

/**
 * Get team's next matches
 * @param {string} teamId - Team identifier
 */
export async function getSoccerNextMatches(teamId: string): Promise<unknown> {
  try {
    log.info('Getting soccer next matches', { teamId });

    // Check cache first
    const cachedData = await soccerCache.getNextMatches(teamId);
    if (cachedData) {
      soccerCache.logApiCall(
        `/nextmatches/${teamId}`,
        'getTeamNextMatches',
        true
      );
      log.info('Soccer next matches retrieved from cache', { teamId });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(
      `/nextmatches/${teamId}`,
      'getTeamNextMatches',
      false
    );
    const matches = await soccerClient.getTeamNextMatches(teamId);

    // Store in cache
    await soccerCache.setNextMatches(teamId, matches.events || []);

    log.info('Soccer next matches retrieved from API and cached', {
      teamId,
    });
    return matches;
  } catch (error) {
    log.error('Failed to get soccer next matches', { teamId, error });
    throw new AppError(
      'soccer-next-matches-failed',
      'Failed to get soccer next matches',
      500,
      { teamId }
    );
  }
}

/**
 * Get team's previous matches
 * @param {string} teamId - Team identifier
 */
export async function getSoccerPreviousMatches(
  teamId: string
): Promise<unknown> {
  try {
    log.info('Getting soccer previous matches', { teamId });

    // Check cache first
    const cachedData = await soccerCache.getPreviousMatches(teamId);
    if (cachedData) {
      soccerCache.logApiCall(
        `/previousmatches/${teamId}`,
        'getTeamPreviousMatches',
        true
      );
      log.info('Soccer previous matches retrieved from cache', { teamId });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(
      `/previousmatches/${teamId}`,
      'getTeamPreviousMatches',
      false
    );
    const matches = await soccerClient.getTeamPreviousMatches(teamId);

    // Store in cache
    await soccerCache.setPreviousMatches(teamId, matches.events || []);

    log.info('Soccer previous matches retrieved from API and cached', {
      teamId,
    });
    return matches;
  } catch (error) {
    log.error('Failed to get soccer previous matches', { teamId, error });
    throw new AppError(
      'soccer-previous-matches-failed',
      'Failed to get soccer previous matches',
      500,
      { teamId }
    );
  }
}

/**
 * Search for teams or players
 * @param {string} query - Search query
 * @param {'teams' | 'players'} type - Search type
 */
export async function searchSoccer(
  query: string,
  type: 'teams' | 'players'
): Promise<unknown> {
  try {
    log.info('Searching soccer data', { query, type });

    let results;
    if (type === 'teams') {
      results = await soccerClient.searchTeams(query);
    } else {
      results = await soccerClient.searchPlayers(query);
    }

    const resultCount =
      type === 'teams'
        ? (results as { teams?: unknown[] }).teams?.length || 0
        : (results as { player?: unknown[] }).player?.length || 0;

    log.info('Soccer search completed', {
      query,
      type,
      resultCount,
    });
    return results;
  } catch (error) {
    log.error('Failed to search soccer data', { query, type, error });
    throw new AppError(
      'soccer-search-failed',
      'Failed to search soccer data',
      500,
      { query, type }
    );
  }
}

/**
 * Search for soccer teams by name
 * @param {string} teamName - Name of the team to search for
 */
export async function searchSoccerTeams(teamName: string): Promise<unknown> {
  try {
    log.info('Searching soccer teams', { teamName });

    const results = await soccerClient.searchTeams(teamName);
    const resultCount = (results as { teams?: unknown[] }).teams?.length || 0;

    log.info('Soccer teams search completed', {
      teamName,
      resultCount,
    });

    return results;
  } catch (error) {
    log.error('Failed to search soccer teams', { teamName, error });
    throw new AppError(
      'soccer-teams-search-failed',
      'Failed to search soccer teams',
      500,
      { teamName }
    );
  }
}

/**
 * Get matches by date
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getSoccerMatchesByDate(date: string): Promise<unknown> {
  try {
    log.info('Getting soccer matches by date', { date });

    // Check cache first
    const cachedData = await soccerCache.getMatchesByDate(date);
    if (cachedData) {
      soccerCache.logApiCall(`/matches/${date}`, 'getMatchesByDate', true);
      log.info('Soccer matches by date retrieved from cache', { date });
      return cachedData;
    }

    // Cache miss - fetch from API
    soccerCache.logApiCall(`/matches/${date}`, 'getMatchesByDate', false);
    const matches = await soccerClient.getMatchesByDate(date);

    // Store in cache
    await soccerCache.setMatchesByDate(date, matches.events || []);

    log.info('Soccer matches by date retrieved from API and cached', {
      date,
    });
    return matches;
  } catch (error) {
    log.error('Failed to get soccer matches by date', { date, error });
    throw new AppError(
      'soccer-matches-by-date-failed',
      'Failed to get soccer matches by date',
      500,
      { date }
    );
  }
}

/**
 * Gets combined soccer matches data (upcoming and past) optimized for rate limits
 * This function intelligently manages API calls to respect rate limits while providing
 * fresh data when needed and using cached data when appropriate
 * @param {string} leagueId - League ID to get matches for
 */
export async function getSoccerCombinedMatches(
  leagueId: string
): Promise<unknown> {
  try {
    log.info('Getting combined soccer matches', { leagueId });

    // Check both caches first
    const [cachedNext, cachedPrevious] = await Promise.all([
      soccerCache.getNextMatches(leagueId),
      soccerCache.getPreviousMatches(leagueId),
    ]);

    let nextMatches = cachedNext;
    let previousMatches = cachedPrevious;
    let apiCallsMade = 0;

    // If we don't have cached next matches or they're expired, fetch them
    if (!nextMatches) {
      try {
        soccerCache.logApiCall(
          `/eventsnextleague.php?id=${leagueId}`,
          'getCombinedMatches-next',
          false
        );
        const nextResponse = await soccerClient.getLeagueNextMatches(leagueId);
        nextMatches = nextResponse.events || [];
        await soccerCache.setNextMatches(leagueId, nextMatches);
        apiCallsMade++;
      } catch (error) {
        log.error('Error fetching next matches', { leagueId, error });
        nextMatches = []; // Fallback to empty array
      }
    } else {
      soccerCache.logApiCall(
        `/eventsnextleague.php?id=${leagueId}`,
        'getCombinedMatches-next',
        true
      );
    }

    // If we don't have cached previous matches or they're expired, fetch them
    // But only if we haven't made too many API calls already
    if (!previousMatches && apiCallsMade < 1) {
      try {
        soccerCache.logApiCall(
          `/eventspastleague.php?id=${leagueId}`,
          'getCombinedMatches-previous',
          false
        );
        const prevResponse =
          await soccerClient.getLeaguePreviousMatches(leagueId);
        previousMatches = prevResponse.events || [];
        await soccerCache.setPreviousMatches(leagueId, previousMatches);
        apiCallsMade++;
      } catch (error) {
        log.error('Error fetching previous matches', { leagueId, error });
        previousMatches = []; // Fallback to empty array
      }
    } else if (previousMatches) {
      soccerCache.logApiCall(
        `/eventspastleague.php?id=${leagueId}`,
        'getCombinedMatches-previous',
        true
      );
    }

    // Filter out any overlapping matches (shouldn't happen but safety measure)
    const currentDate = new Date();

    interface MatchData {
      dateEvent?: string;
      [key: string]: unknown;
    }

    const filteredNextMatches = (nextMatches as MatchData[]).filter((match) => {
      if (!match?.dateEvent) return true;
      const matchDate = new Date(match.dateEvent);
      return matchDate >= currentDate;
    });

    const filteredPreviousMatches = (previousMatches as MatchData[]).filter(
      (match) => {
        if (!match?.dateEvent) return true;
        const matchDate = new Date(match.dateEvent);
        return matchDate < currentDate;
      }
    );

    const result = {
      nextMatches: {
        success: true,
        data: filteredNextMatches,
      },
      previousMatches: {
        success: true,
        data: filteredPreviousMatches,
      },
      apiCallsMade,
      cacheStatus: {
        nextFromCache: !!cachedNext,
        previousFromCache: !!cachedPrevious,
      },
    };

    log.info('Combined soccer matches retrieved successfully', {
      leagueId,
      nextCount: filteredNextMatches.length,
      previousCount: filteredPreviousMatches.length,
      apiCallsMade,
    });

    return result;
  } catch (error) {
    log.error('Failed to get combined soccer matches', { leagueId, error });
    throw new AppError(
      'soccer-combined-matches-failed',
      'Failed to get combined soccer matches',
      500,
      { leagueId }
    );
  }
}
