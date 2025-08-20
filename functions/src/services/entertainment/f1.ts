import { ApiClientFactory } from '../_core/clientFactory.js';
import { HttpClient } from '../_core/httpClient.js';

/**
 * Formula 1 API client (Ergast)
 * Free API with complete F1 information since 1950
 */
export class F1Client {
  private client: HttpClient;

  constructor() {
    this.client = ApiClientFactory.createF1Client();
  }

  /**
   * Gets the current drivers championship standings
   * @param {number} year - Championship year (defaults to current year)
   * @return {Promise<F1DriverStanding[]>} Array of driver standings with points and wins
   */
  async getDriverStandings(
    year: number = new Date().getFullYear()
  ): Promise<F1DriverStanding[]> {
    const endpoint = `/${year}/driverStandings.json`;
    const response = await this.client.get<F1StandingsResponse>(endpoint);

    const standings = response.data.MRData.StandingsTable.StandingsLists[0];
    if (!standings) {
      throw new Error(`No standings found for year ${year}`);
    }

    return standings.DriverStandings.map((standing) => ({
      position: parseInt(standing.position),
      points: parseFloat(standing.points),
      wins: parseInt(standing.wins),
      driver: {
        id: standing.Driver.driverId,
        firstName: standing.Driver.givenName,
        lastName: standing.Driver.familyName,
        nationality: standing.Driver.nationality,
        code: standing.Driver.code,
      },
      constructor: {
        id: standing.Constructors[0].constructorId,
        name: standing.Constructors[0].name,
        nationality: standing.Constructors[0].nationality,
      },
    }));
  }

  /**
   * Gets the constructors championship standings
   * @param {number} year - Championship year (defaults to current year)
   * @return {Promise<F1ConstructorStanding[]>} Array of constructor standings with points and wins
   */
  async getConstructorStandings(
    year: number = new Date().getFullYear()
  ): Promise<F1ConstructorStanding[]> {
    const endpoint = `/${year}/constructorStandings.json`;
    const response =
      await this.client.get<F1ConstructorStandingsResponse>(endpoint);

    const standings = response.data.MRData.StandingsTable.StandingsLists[0];
    if (!standings) {
      throw new Error(`No constructor standings found for year ${year}`);
    }

    return standings.ConstructorStandings.map((standing) => ({
      position: parseInt(standing.position),
      points: parseFloat(standing.points),
      wins: parseInt(standing.wins),
      constructor: {
        id: standing.Constructor.constructorId,
        name: standing.Constructor.name,
        nationality: standing.Constructor.nationality,
        url: standing.Constructor.url,
      },
    }));
  }

  /**
   * Gets information about the next upcoming race
   * @return {Promise<F1Race | null>} Next race information or null if season is over
   */
  async getNextRace(): Promise<F1Race | null> {
    const year = new Date().getFullYear();
    const endpoint = `/${year}.json`;
    const response = await this.client.get<F1RaceResponse>(endpoint);

    const races = response.data.MRData.RaceTable.Races;
    const now = new Date();

    const nextRace = races.find((race) => new Date(race.date) > now);
    if (!nextRace) return null;

    return {
      season: nextRace.season,
      round: parseInt(nextRace.round),
      name: nextRace.raceName,
      date: nextRace.date,
      time: nextRace.time,
      circuit: {
        id: nextRace.Circuit.circuitId,
        name: nextRace.Circuit.circuitName,
        country: nextRace.Circuit.Location.country,
        locality: nextRace.Circuit.Location.locality,
      },
    };
  }

  /**
   * Gets results from a specific race
   * @param {number} year - Race year
   * @param {number} round - Race round number in the season
   * @return {Promise<F1RaceResult[]>} Array of race results with driver positions and times
   */
  async getRaceResults(year: number, round: number): Promise<F1RaceResult[]> {
    const endpoint = `/${year}/${round}/results.json`;
    const response = await this.client.get<F1ResultsResponse>(endpoint);

    const race = response.data.MRData.RaceTable.Races[0];
    if (!race || !race.Results) {
      throw new Error(`No results found for ${year} round ${round}`);
    }

    return race.Results.map((result) => ({
      position: parseInt(result.position),
      points: parseFloat(result.points),
      driver: {
        id: result.Driver.driverId,
        firstName: result.Driver.givenName,
        lastName: result.Driver.familyName,
        code: result.Driver.code,
      },
      constructor: {
        id: result.Constructor.constructorId,
        name: result.Constructor.name,
      },
      grid: parseInt(result.grid),
      laps: parseInt(result.laps),
      status: result.status,
      time: result.Time?.time,
      fastestLap: result.FastestLap
        ? {
            rank: parseInt(result.FastestLap.rank),
            lap: parseInt(result.FastestLap.lap),
            time: result.FastestLap.Time.time,
            speed: parseFloat(result.FastestLap.AverageSpeed.speed),
          }
        : undefined,
    }));
  }
}

// Types for F1 API
export interface F1DriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    nationality: string;
    code?: string;
  };
  constructor: {
    id: string;
    name: string;
    nationality: string;
  };
}

export interface F1ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructor: {
    id: string;
    name: string;
    nationality: string;
    url?: string;
  };
}

export interface F1Race {
  season: string;
  round: number;
  name: string;
  date: string;
  time?: string;
  circuit: {
    id: string;
    name: string;
    country: string;
    locality: string;
  };
}

export interface F1RaceResult {
  position: number;
  points: number;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    code?: string;
  };
  constructor: {
    id: string;
    name: string;
  };
  grid: number;
  laps: number;
  status: string;
  time?: string;
  fastestLap?: {
    rank: number;
    lap: number;
    time: string;
    speed: number;
  };
}

// Internal API response types
interface F1StandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: Array<{
          position: string;
          points: string;
          wins: string;
          Driver: {
            driverId: string;
            givenName: string;
            familyName: string;
            nationality: string;
            code?: string;
          };
          Constructors: Array<{
            constructorId: string;
            name: string;
            nationality: string;
          }>;
        }>;
      }>;
    };
  };
}

interface F1ConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        ConstructorStandings: Array<{
          position: string;
          points: string;
          wins: string;
          Constructor: {
            constructorId: string;
            name: string;
            nationality: string;
            url: string;
          };
        }>;
      }>;
    };
  };
}

interface F1RaceResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        season: string;
        round: string;
        raceName: string;
        date: string;
        time?: string;
        Circuit: {
          circuitId: string;
          circuitName: string;
          Location: {
            country: string;
            locality: string;
          };
        };
      }>;
    };
  };
}

interface F1ResultsResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        Results?: Array<{
          position: string;
          points: string;
          Driver: {
            driverId: string;
            givenName: string;
            familyName: string;
            code?: string;
          };
          Constructor: {
            constructorId: string;
            name: string;
          };
          grid: string;
          laps: string;
          status: string;
          Time?: {
            time: string;
          };
          FastestLap?: {
            rank: string;
            lap: string;
            Time: {
              time: string;
            };
            AverageSpeed: {
              speed: string;
            };
          };
        }>;
      }>;
    };
  };
}
