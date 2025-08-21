import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { F1Client } from './services/entertainment/f1.js';
import { F1CacheService } from './services/entertainment/f1Cache.js';
import { SoccerCacheService } from './services/entertainment/soccerCache.js';
import { TheSportsDBClient } from './services/entertainment/theSportsDB.js';

// Initialize F1 client and cache service
const f1Client = new F1Client();
const f1Cache = new F1CacheService();

// Initialize Soccer client and cache service
const soccerClient = new TheSportsDBClient();
const soccerCache = new SoccerCacheService();

/**
 * Gets F1 driver standings for a specific year
 */
export const getF1DriverStandings = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { year = new Date().getFullYear() } = request.data || {};

      // Check cache first
      const cachedData = await f1Cache.getDriverStandings(year);
      if (cachedData) {
        f1Cache.logApiCall(
          `/standings-drivers?year=${year}`,
          'getDriverStandings',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(
        `/standings-drivers?year=${year}`,
        'getDriverStandings',
        false
      );
      const standings = await f1Client.getDriverStandings(year);

      // Store in cache
      await f1Cache.setDriverStandings(year, standings);

      return { success: true, data: standings };
    } catch (error) {
      console.error('Error fetching F1 driver standings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets F1 constructor standings for a specific year
 */
export const getF1ConstructorStandings = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { year = new Date().getFullYear() } = request.data || {};

      // Check cache first
      const cachedData = await f1Cache.getConstructorStandings(year);
      if (cachedData) {
        f1Cache.logApiCall(
          `/standings-controllers?year=${year}`,
          'getConstructorStandings',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(
        `/standings-controllers?year=${year}`,
        'getConstructorStandings',
        false
      );
      const standings = await f1Client.getConstructorStandings(year);

      // Store in cache
      await f1Cache.setConstructorStandings(year, standings);

      return { success: true, data: standings };
    } catch (error) {
      console.error('Error fetching F1 constructor standings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets information about the next F1 race (Cache-only, updated by scheduled functions)
 */
export const getF1NextRace = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async () => {
    try {
      // Only serve from cache - next race is updated by scheduled functions
      const cachedData = await f1Cache.getNextRace();
      if (cachedData) {
        f1Cache.logApiCall('/schedule?year=current', 'getNextRace', true);
        return { success: true, data: cachedData };
      }

      // No cached data available
      console.warn('No cached next race found - waiting for scheduled update');
      return {
        success: false,
        error: 'Next race data not available yet. Please try again later.',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching next F1 race:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
      };
    }
  }
);

/**
 * Gets F1 race schedule for a specific year
 */
export const getF1Schedule = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { year = new Date().getFullYear() } = request.data || {};

      // Check cache first
      const cachedData = await f1Cache.getSchedule(year);
      if (cachedData) {
        f1Cache.logApiCall(`/schedule?year=${year}`, 'getSchedule', true);
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(`/schedule?year=${year}`, 'getSchedule', false);
      const schedule = await f1Client.getSchedule(year);

      // Store in cache
      await f1Cache.setSchedule(year, schedule);

      return { success: true, data: schedule };
    } catch (error) {
      console.error('Error fetching F1 schedule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets F1 news (Cache-only, populated by scheduled functions)
 */
export const getF1News = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { limit = 25 } = request.data || {};

      // Only serve from cache - news is updated by scheduled functions
      const cachedData = await f1Cache.getNews();
      if (cachedData) {
        f1Cache.logApiCall(`/news?limit=${limit}`, 'getNews', true);
        // Return only the requested number of articles
        const limitedData = Array.isArray(cachedData)
          ? cachedData.slice(0, limit)
          : cachedData;
        return { success: true, data: limitedData };
      }

      // No cached data available
      console.warn('No cached F1 news found - waiting for scheduled update');
      return {
        success: false,
        error: 'News data not available yet. Please try again later.',
        data: [],
      };
    } catch (error) {
      console.error('Error fetching F1 news:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      };
    }
  }
);

/**
 * Gets detailed information about a specific F1 driver
 */
export const getF1DriverInfo = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { driverId } = request.data || {};
      if (!driverId) {
        throw new Error('Driver ID is required');
      }

      // Check cache first
      const cachedData = await f1Cache.getDriverInfo(driverId);
      if (cachedData) {
        f1Cache.logApiCall(
          `/athlete-info?athleteId=${driverId}`,
          'getDriverInfo',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(
        `/athlete-info?athleteId=${driverId}`,
        'getDriverInfo',
        false
      );
      const driverInfo = await f1Client.getDriverInfo(driverId);

      // Store in cache
      await f1Cache.setDriverInfo(driverId, driverInfo);

      return { success: true, data: driverInfo };
    } catch (error) {
      console.error('Error fetching F1 driver info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets race results for a specific F1 driver
 */
export const getF1DriverRaceResults = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { driverId, year = new Date().getFullYear() } = request.data || {};
      if (!driverId) {
        throw new Error('Driver ID is required');
      }

      // Check cache first
      const cachedData = await f1Cache.getDriverResults(driverId, year);
      if (cachedData) {
        f1Cache.logApiCall(
          `/race-results?driverId=${driverId}&year=${year}`,
          'getDriverRaceResults',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(
        `/race-results?driverId=${driverId}&year=${year}`,
        'getDriverRaceResults',
        false
      );
      const results = await f1Client.getDriverRaceResults(driverId, year);

      // Store in cache
      await f1Cache.setDriverResults(driverId, year, results);

      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching F1 driver race results:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets statistics for a specific F1 driver
 */
export const getF1DriverStats = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { driverId } = request.data || {};
      if (!driverId) {
        throw new Error('Driver ID is required');
      }

      // Check cache first
      const cachedData = await f1Cache.getDriverStats(driverId);
      if (cachedData) {
        f1Cache.logApiCall(
          `/stats?driverId=${driverId}`,
          'getDriverStats',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      f1Cache.logApiCall(
        `/stats?driverId=${driverId}`,
        'getDriverStats',
        false
      );
      const stats = await f1Client.getDriverStats(driverId);

      // Store in cache
      await f1Cache.setDriverStats(driverId, stats);

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching F1 driver stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Scheduled function to update F1 news
 * Runs Monday, Wednesday, Friday, Saturday, Sunday at 6:00 AM UTC
 */
export const updateF1News = onSchedule(
  {
    schedule: '0 6 * * 1,3,5,6,0', // Mon, Wed, Fri, Sat, Sun at 6:00 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
    retryCount: 3,
    maxInstances: 1,
  },
  async (event) => {
    try {
      console.log('🏎️ Starting F1 news update...', {
        eventTime: event.scheduleTime,
      });

      // Fetch latest news from API
      const news = await f1Client.getNews(50); // Get 50 latest articles

      // Store in cache and individual documents
      await f1Cache.storeNewsArticles(news);

      console.log(`✅ Successfully updated F1 news: ${news.length} articles`);
    } catch (error) {
      console.error('❌ Error updating F1 news:', error);
      throw error; // Re-throw to trigger retry
    }
  }
);

/**
 * Scheduled function to update next race information
 * Runs every Monday at 7:00 AM UTC (after race weekends)
 */
export const updateF1NextRace = onSchedule(
  {
    schedule: '0 7 * * 1', // Every Monday at 7:00 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
    retryCount: 3,
    maxInstances: 1,
  },
  async (event) => {
    try {
      console.log('🏁 Starting F1 next race update...', {
        eventTime: event.scheduleTime,
      });

      // Fetch next race from API
      const nextRace = await f1Client.getNextRace();

      // Store in cache
      if (nextRace) {
        await f1Cache.setNextRace(nextRace);
        console.log('✅ Successfully updated F1 next race information');
      } else {
        console.warn('⚠️ No next race data available');
      }
    } catch (error) {
      console.error('❌ Error updating F1 next race:', error);
      throw error; // Re-throw to trigger retry
    }
  }
);

// ============= SOCCER FUNCTIONS =============

/**
 * Gets soccer league standings for a specific league and season
 */
export const getSoccerLeagueStandings = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { leagueId, season } = request.data || {};

      if (!leagueId) {
        return {
          success: false,
          error: 'League ID is required',
        };
      }

      // Use current year, but if we're early in the year, try previous year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12

      // Soccer seasons typically run from August to May (e.g., "2025-2026")
      // If it's August or later, we're in the new season starting that year
      // If it's before August, we're still in the previous season
      const seasonStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
      const defaultSeason = `${seasonStartYear}-${seasonStartYear + 1}`;

      const currentSeason = season || defaultSeason;

      // Check cache first
      const cachedData = await soccerCache.getStandings(
        leagueId,
        currentSeason
      );
      if (cachedData) {
        soccerCache.logApiCall(
          `/lookuptable.php?l=${leagueId}&s=${currentSeason}`,
          'getLeagueStandings',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/lookuptable.php?l=${leagueId}&s=${currentSeason}`,
        'getLeagueStandings',
        false
      );
      const standings = await soccerClient.getLeagueStandings(
        leagueId,
        currentSeason
      );

      // Handle case where standings might be null or empty
      const standingsData = standings?.table || [];

      // Store in cache
      await soccerCache.setStandings(leagueId, currentSeason, standingsData);

      return { success: true, data: standingsData };
    } catch (error) {
      console.error('Error fetching soccer league standings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [], // Return empty array instead of undefined
      };
    }
  }
);

/**
 * Gets teams for a specific league
 */
export const getSoccerLeagueTeams = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { leagueName } = request.data || {};

      if (!leagueName) {
        return {
          success: false,
          error: 'League name is required',
        };
      }

      // For caching, we'll use a simplified league ID based on the name
      const leagueId = leagueName.toLowerCase().replace(/\s+/g, '_');

      // Check cache first
      const cachedData = await soccerCache.getLeagueTeams(leagueId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/search_all_teams.php?l=${leagueName}`,
          'getLeagueTeams',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/search_all_teams.php?l=${leagueName}`,
        'getLeagueTeams',
        false
      );
      const teams = await soccerClient.getLeagueTeams(leagueName);

      // Store in cache
      await soccerCache.setLeagueTeams(leagueId, teams.teams || []);

      return { success: true, data: teams.teams || [] };
    } catch (error) {
      console.error('Error fetching soccer league teams:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets next matches for a specific league
 */
export const getSoccerNextMatches = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { leagueId } = request.data || {};

      if (!leagueId) {
        return {
          success: false,
          error: 'League ID is required',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getNextMatches(leagueId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/eventsnextleague.php?id=${leagueId}`,
          'getNextMatches',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/eventsnextleague.php?id=${leagueId}`,
        'getNextMatches',
        false
      );
      const matches = await soccerClient.getLeagueNextMatches(leagueId);

      // Store in cache
      await soccerCache.setNextMatches(leagueId, matches.events || []);

      return { success: true, data: matches.events || [] };
    } catch (error) {
      console.error('Error fetching soccer next matches:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets previous matches for a specific league
 */
export const getSoccerPreviousMatches = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { leagueId } = request.data || {};

      if (!leagueId) {
        return {
          success: false,
          error: 'League ID is required',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getPreviousMatches(leagueId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/eventspastleague.php?id=${leagueId}`,
          'getPreviousMatches',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/eventspastleague.php?id=${leagueId}`,
        'getPreviousMatches',
        false
      );
      const matches = await soccerClient.getLeaguePreviousMatches(leagueId);

      // Store in cache
      await soccerCache.setPreviousMatches(leagueId, matches.events || []);

      return { success: true, data: matches.events || [] };
    } catch (error) {
      console.error('Error fetching soccer previous matches:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets matches for a specific date
 */
export const getSoccerMatchesByDate = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { date, sport = 'Soccer' } = request.data || {};

      if (!date) {
        return {
          success: false,
          error: 'Date is required (YYYY-MM-DD format)',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getMatchesByDate(date);
      if (cachedData) {
        soccerCache.logApiCall(
          `/eventsday.php?d=${date}&s=${sport}`,
          'getMatchesByDate',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/eventsday.php?d=${date}&s=${sport}`,
        'getMatchesByDate',
        false
      );
      const matches = await soccerClient.getMatchesByDate(date, sport);

      // Store in cache
      await soccerCache.setMatchesByDate(date, matches.events || []);

      return { success: true, data: matches.events || [] };
    } catch (error) {
      console.error('Error fetching soccer matches by date:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets team information by team ID
 */
export const getSoccerTeamInfo = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { teamId } = request.data || {};

      if (!teamId) {
        return {
          success: false,
          error: 'Team ID is required',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getTeamInfo(teamId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/lookupteam.php?id=${teamId}`,
          'getTeamInfo',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/lookupteam.php?id=${teamId}`,
        'getTeamInfo',
        false
      );
      const team = await soccerClient.getTeamInfo(teamId);

      // Store in cache
      const teamData = team.teams?.[0] || null;
      await soccerCache.setTeamInfo(teamId, teamData);

      return { success: true, data: teamData };
    } catch (error) {
      console.error('Error fetching soccer team info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets team players by team ID
 */
export const getSoccerTeamPlayers = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { teamId } = request.data || {};

      if (!teamId) {
        return {
          success: false,
          error: 'Team ID is required',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getTeamPlayers(teamId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/lookup_all_players.php?id=${teamId}`,
          'getTeamPlayers',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/lookup_all_players.php?id=${teamId}`,
        'getTeamPlayers',
        false
      );
      const players = await soccerClient.getTeamPlayers(teamId);

      // Store in cache
      await soccerCache.setTeamPlayers(teamId, players.player || []);

      return { success: true, data: players.player || [] };
    } catch (error) {
      console.error('Error fetching soccer team players:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets player information by player ID
 */
export const getSoccerPlayerInfo = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { playerId } = request.data || {};

      if (!playerId) {
        return {
          success: false,
          error: 'Player ID is required',
        };
      }

      // Check cache first
      const cachedData = await soccerCache.getPlayerInfo(playerId);
      if (cachedData) {
        soccerCache.logApiCall(
          `/lookupplayer.php?id=${playerId}`,
          'getPlayerInfo',
          true
        );
        return { success: true, data: cachedData };
      }

      // Cache miss - fetch from API
      soccerCache.logApiCall(
        `/lookupplayer.php?id=${playerId}`,
        'getPlayerInfo',
        false
      );
      const player = await soccerClient.getPlayerInfo(playerId);

      // Store in cache
      const playerData = player.player?.[0] || null;
      await soccerCache.setPlayerInfo(playerId, playerData);

      return { success: true, data: playerData };
    } catch (error) {
      console.error('Error fetching soccer player info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Search for teams by name
 */
export const searchSoccerTeams = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { teamName } = request.data || {};

      if (!teamName) {
        return {
          success: false,
          error: 'Team name is required',
        };
      }

      // No caching for search results to ensure fresh data
      soccerCache.logApiCall(
        `/searchteams.php?t=${teamName}`,
        'searchTeams',
        false
      );
      const teams = await soccerClient.searchTeams(teamName);

      return { success: true, data: teams.teams || [] };
    } catch (error) {
      console.error('Error searching soccer teams:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Search for players by name
 */
export const searchSoccerPlayers = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { playerName } = request.data || {};

      if (!playerName) {
        return {
          success: false,
          error: 'Player name is required',
        };
      }

      // No caching for search results to ensure fresh data
      soccerCache.logApiCall(
        `/searchplayers.php?p=${playerName}`,
        'searchPlayers',
        false
      );
      const players = await soccerClient.searchPlayers(playerName);

      return { success: true, data: players.player || [] };
    } catch (error) {
      console.error('Error searching soccer players:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Gets combined soccer matches data (upcoming and past) optimized for rate limits
 * This function intelligently manages API calls to respect rate limits while providing
 * fresh data when needed and using cached data when appropriate
 */
export const getSoccerCombinedMatches = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const { leagueId } = request.data || {};

      if (!leagueId) {
        return {
          success: false,
          error: 'League ID is required',
        };
      }

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
          const nextResponse =
            await soccerClient.getLeagueNextMatches(leagueId);
          nextMatches = nextResponse.events || [];
          await soccerCache.setNextMatches(leagueId, nextMatches);
          apiCallsMade++;
        } catch (error) {
          console.error('Error fetching next matches:', error);
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
          console.error('Error fetching previous matches:', error);
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

      const filteredNextMatches = (nextMatches as MatchData[]).filter(
        (match) => {
          if (!match?.dateEvent) return true;
          const matchDate = new Date(match.dateEvent);
          return matchDate >= currentDate;
        }
      );

      const filteredPreviousMatches = (previousMatches as MatchData[]).filter(
        (match) => {
          if (!match?.dateEvent) return true;
          const matchDate = new Date(match.dateEvent);
          return matchDate < currentDate;
        }
      );

      return {
        success: true,
        data: {
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
        },
      };
    } catch (error) {
      console.error('Error fetching combined soccer matches:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

/**
 * Scheduled function to update soccer match data
 * Runs every day at 8:00 AM UTC to update match schedules
 */
export const updateSoccerDailyMatches = onSchedule(
  {
    schedule: '0 8 * * *', // Every day at 8:00 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
    retryCount: 3,
    maxInstances: 1,
  },
  async (event) => {
    try {
      console.log('⚽ Starting soccer daily matches update...', {
        eventTime: event.scheduleTime,
      });

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Fetch today's matches from API
      const matches = await soccerClient.getMatchesByDate(today, 'Soccer');

      // Store in cache
      await soccerCache.setMatchesByDate(today, matches.events || []);

      console.log(
        `✅ Successfully updated soccer matches for ${today}: ${matches.events?.length || 0} matches`
      );
    } catch (error) {
      console.error('❌ Error updating soccer daily matches:', error);
      throw error; // Re-throw to trigger retry
    }
  }
);
