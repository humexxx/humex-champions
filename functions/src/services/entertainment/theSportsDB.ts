import {
  SoccerLeaguesResponse,
  SoccerMatchesResponse,
  SoccerPlayersResponse,
  SoccerSeasonsResponse,
  SoccerStandingsResponse,
  SoccerTeamsResponse,
  SoccerVenuesResponse,
} from '@shared/types/entertainment/soccer';
import { logger } from 'firebase-functions/v2';

/**
 * TheSportsDB API Client
 * Provides access to soccer/football data from TheSportsDB.com
 *
 * Rate Limits:
 * - Free: 30 requests per minute
 * - Premium: 100 requests per minute
 */
export class TheSportsDBClient {
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.THESPORTSDB_API_KEY || '123'; // Default to free key

    if (this.apiKey === '123') {
      logger.warn(
        '⚠️ Using free TheSportsDB API key - consider upgrading for higher limits'
      );
    }
  }

  /**
   * Generic HTTP request handler with error handling
   * @param {string} endpoint - API endpoint to request
   * @return {Promise<T>} Promise resolving to API response data
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/${this.apiKey}/${endpoint}`;

    logger.debug(`[TheSportsDB] GET ${endpoint}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get response text first to check if it's empty
      const responseText = await response.text();

      if (!responseText || responseText.trim().length === 0) {
        logger.warn(
          `[TheSportsDB] Empty response for ${endpoint} - may indicate no data available for this request`
        );
        // Return empty structure based on common response patterns
        return {
          table: [],
          teams: [],
          players: [],
          events: [],
          leagues: [],
          seasons: [],
        } as T;
      }

      try {
        const data = JSON.parse(responseText);
        logger.debug(`[TheSportsDB] Success: ${response.status} ${endpoint}`);

        // Log if we received an empty result set
        if (data && typeof data === 'object') {
          const hasData = Object.values(data).some(
            (value) => Array.isArray(value) && value.length > 0
          );
          if (!hasData) {
            logger.info(
              `[TheSportsDB] No data found for ${endpoint} - this may be normal for some queries`
            );
          }
        }

        return data;
      } catch (parseError) {
        logger.error(`[TheSportsDB] JSON parse error for ${endpoint}:`, {
          error: parseError,
          responseText: responseText.substring(0, 200), // Log first 200 chars
          url: url,
        });
        throw new Error(
          `Invalid JSON response from TheSportsDB API. This may indicate an API issue or invalid parameters.`
        );
      }
    } catch (error) {
      logger.error(`[TheSportsDB] Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============= SEARCH FUNCTIONS =============

  /**
   * Search for teams by name
   * @param {string} teamName Team name to search for
   * @return {Promise<SoccerTeamsResponse>} Promise resolving to teams search results
   */
  async searchTeams(teamName: string): Promise<SoccerTeamsResponse> {
    return this.makeRequest<SoccerTeamsResponse>(
      `searchteams.php?t=${encodeURIComponent(teamName)}`
    );
  }

  /**
   * Search for players by name
   * @param {string} playerName Player name to search for
   * @return {Promise<SoccerPlayersResponse>} Promise resolving to players search results
   */
  async searchPlayers(playerName: string): Promise<SoccerPlayersResponse> {
    return this.makeRequest<SoccerPlayersResponse>(
      `searchplayers.php?p=${encodeURIComponent(playerName)}`
    );
  }

  /**
   * Search for events/matches by team names
   * @param {string} eventName Event name (e.g., "Arsenal_vs_Chelsea")
   * @param {string} [season] Optional season filter
   * @param {string} [date] Optional date filter (YYYY-MM-DD)
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to matches search results
   */
  async searchEvents(
    eventName: string,
    season?: string,
    date?: string
  ): Promise<SoccerMatchesResponse> {
    let endpoint = `searchevents.php?e=${encodeURIComponent(eventName)}`;
    if (season) endpoint += `&s=${encodeURIComponent(season)}`;
    if (date) endpoint += `&d=${date}`;

    return this.makeRequest<SoccerMatchesResponse>(endpoint);
  }

  /**
   * Search for venues by name
   * @param {string} venueName Venue name to search for
   * @return {Promise<SoccerVenuesResponse>} Promise resolving to venues search results
   */
  async searchVenues(venueName: string): Promise<SoccerVenuesResponse> {
    return this.makeRequest<SoccerVenuesResponse>(
      `searchvenues.php?v=${encodeURIComponent(venueName)}`
    );
  }

  // ============= LOOKUP FUNCTIONS =============

  /**
   * Get league details by ID
   * @param {string} leagueId League ID
   * @return {Promise<SoccerLeaguesResponse>} Promise resolving to league information
   */
  async getLeagueInfo(leagueId: string): Promise<SoccerLeaguesResponse> {
    return this.makeRequest<SoccerLeaguesResponse>(
      `lookupleague.php?id=${leagueId}`
    );
  }

  /**
   * Get league standings/table by league ID
   * @param {string} leagueId League ID
   * @param {string} [season] Optional season (e.g., "2023-2024")
   * @return {Promise<SoccerStandingsResponse>} Promise resolving to league standings
   */
  async getLeagueStandings(
    leagueId: string,
    season?: string
  ): Promise<SoccerStandingsResponse> {
    let endpoint = `lookuptable.php?l=${leagueId}`;
    if (season) endpoint += `&s=${encodeURIComponent(season)}`;

    return this.makeRequest<SoccerStandingsResponse>(endpoint);
  }

  /**
   * Get team details by ID
   * @param {string} teamId Team ID
   * @return {Promise<SoccerTeamsResponse>} Promise resolving to team information
   */
  async getTeamInfo(teamId: string): Promise<SoccerTeamsResponse> {
    return this.makeRequest<SoccerTeamsResponse>(`lookupteam.php?id=${teamId}`);
  }

  /**
   * Get player details by ID
   * @param {string} playerId Player ID
   * @return {Promise<SoccerPlayersResponse>} Promise resolving to player information
   */
  async getPlayerInfo(playerId: string): Promise<SoccerPlayersResponse> {
    return this.makeRequest<SoccerPlayersResponse>(
      `lookupplayer.php?id=${playerId}`
    );
  }

  // ============= LIST FUNCTIONS =============

  /**
   * Get all leagues for a specific country and sport
   * @param {string} country Country name (e.g., "England")
   * @param {string} [sport="Soccer"] Sport name (default: "Soccer")
   * @return {Promise<SoccerLeaguesResponse>} Promise resolving to leagues list
   */
  async getLeaguesByCountry(
    country: string,
    sport = 'Soccer'
  ): Promise<SoccerLeaguesResponse> {
    return this.makeRequest<SoccerLeaguesResponse>(
      `search_all_leagues.php?c=${encodeURIComponent(country)}&s=${encodeURIComponent(sport)}`
    );
  }

  /**
   * Get all seasons for a specific league
   * @param {string} leagueId League ID
   * @return {Promise<SoccerSeasonsResponse>} Promise resolving to league seasons
   */
  async getLeagueSeasons(leagueId: string): Promise<SoccerSeasonsResponse> {
    return this.makeRequest<SoccerSeasonsResponse>(
      `search_all_seasons.php?id=${leagueId}`
    );
  }

  /**
   * Get all teams in a specific league
   * @param {string} leagueName League name (e.g., "English Premier League")
   * @return {Promise<SoccerTeamsResponse>} Promise resolving to league teams
   */
  async getLeagueTeams(leagueName: string): Promise<SoccerTeamsResponse> {
    return this.makeRequest<SoccerTeamsResponse>(
      `search_all_teams.php?l=${encodeURIComponent(leagueName)}`
    );
  }

  /**
   * Get all teams for a specific country and sport
   * @param {string} country Country name
   * @param {string} [sport="Soccer"] Sport name (default: "Soccer")
   * @return {Promise<SoccerTeamsResponse>} Promise resolving to country teams
   */
  async getTeamsByCountry(
    country: string,
    sport = 'Soccer'
  ): Promise<SoccerTeamsResponse> {
    return this.makeRequest<SoccerTeamsResponse>(
      `search_all_teams.php?s=${encodeURIComponent(sport)}&c=${encodeURIComponent(country)}`
    );
  }

  /**
   * Get all players for a specific team
   * @param {string} teamId Team ID
   */
  async getTeamPlayers(teamId: string): Promise<SoccerPlayersResponse> {
    return this.makeRequest<SoccerPlayersResponse>(
      `lookup_all_players.php?id=${teamId}`
    );
  }

  // ============= SCHEDULE FUNCTIONS =============

  /**
   * Get next few matches for a team
   * @param {string} teamId Team ID
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to team's next matches
   */
  async getTeamNextMatches(teamId: string): Promise<SoccerMatchesResponse> {
    return this.makeRequest<SoccerMatchesResponse>(
      `eventsnext.php?id=${teamId}`
    );
  }

  /**
   * Get previous few matches for a team
   * @param {string} teamId Team ID
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to team's previous matches
   */
  async getTeamPreviousMatches(teamId: string): Promise<SoccerMatchesResponse> {
    return this.makeRequest<SoccerMatchesResponse>(
      `eventslast.php?id=${teamId}`
    );
  }

  /**
   * Get next few matches for a league
   * @param {string} leagueId League ID
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to league's next matches
   */
  async getLeagueNextMatches(leagueId: string): Promise<SoccerMatchesResponse> {
    return this.makeRequest<SoccerMatchesResponse>(
      `eventsnextleague.php?id=${leagueId}`
    );
  }

  /**
   * Get previous few matches for a league
   * @param {string} leagueId League ID
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to league's previous matches
   */
  async getLeaguePreviousMatches(
    leagueId: string
  ): Promise<SoccerMatchesResponse> {
    return this.makeRequest<SoccerMatchesResponse>(
      `eventspastleague.php?id=${leagueId}`
    );
  }

  /**
   * Get matches for a specific date
   * @param {string} date Date in YYYY-MM-DD format
   * @param {string} [sport] Optional sport filter (default: "Soccer")
   * @param {string} [league] Optional league filter
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to matches for the date
   */
  async getMatchesByDate(
    date: string,
    sport?: string,
    league?: string
  ): Promise<SoccerMatchesResponse> {
    let endpoint = `eventsday.php?d=${date}`;
    if (sport) endpoint += `&s=${encodeURIComponent(sport)}`;
    if (league) endpoint += `&l=${encodeURIComponent(league)}`;

    return this.makeRequest<SoccerMatchesResponse>(endpoint);
  }

  /**
   * Get all matches for a specific season
   * @param {string} leagueId League ID
   * @param {string} season Season (e.g., "2023-2024")
   * @return {Promise<SoccerMatchesResponse>} Promise resolving to season matches
   */
  async getSeasonMatches(
    leagueId: string,
    season: string
  ): Promise<SoccerMatchesResponse> {
    return this.makeRequest<SoccerMatchesResponse>(
      `eventsseason.php?id=${leagueId}&s=${encodeURIComponent(season)}`
    );
  }

  // ============= UTILITY FUNCTIONS =============

  /**
   * Get all available sports
   */
  async getAllSports() {
    return this.makeRequest(`all_sports.php`);
  }

  /**
   * Get all available countries
   */
  async getAllCountries() {
    return this.makeRequest(`all_countries.php`);
  }

  /**
   * Get all available leagues
   */
  async getAllLeagues(): Promise<SoccerLeaguesResponse> {
    return this.makeRequest<SoccerLeaguesResponse>(`all_leagues.php`);
  }

  /**
   * Log API usage for monitoring
   * @param {string} endpoint - API endpoint that was called
   * @param {string} functionName - Name of the function making the call
   * @param {boolean} cached - Whether the result was served from cache
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

export default TheSportsDBClient;
