import { ApiClientFactory } from '../_core/clientFactory.js';
import { HttpClient } from '../_core/httpClient.js';

/**
 * Formula 1 API client (RapidAPI F1 Motorsport Data)
 * Comprehensive F1 data with live race information, standings, news, and more
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
    const endpoint = `/standings-drivers?year=${year}`;
    const response = await this.client.get<F1DriverStandingsResponse>(endpoint);

    if (!response.data.standings?.entries) {
      throw new Error(`No driver standings found for year ${year}`);
    }

    return response.data.standings.entries.map((entry) => ({
      position: entry.stats.find((s) => s.name === 'rank')?.value || 0,
      points: entry.stats.find((s) => s.name === 'points')?.value || 0,
      wins: entry.stats.find((s) => s.name === 'wins')?.value || 0,
      driver: {
        id: entry.athlete.id,
        firstName: entry.athlete.name.split(' ')[0] || '',
        lastName: entry.athlete.name.split(' ').slice(1).join(' ') || '',
        nationality: entry.athlete.flag?.alt || '',
        code: entry.athlete.abbreviation,
        displayName: entry.athlete.displayName,
        shortName: entry.athlete.shortName,
      },
      constructor: {
        // Constructor info would need to be fetched separately or from different endpoint
        id: '',
        name: '',
        nationality: '',
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
    const endpoint = `/standings-controllers?year=${year}`;
    const response =
      await this.client.get<F1ConstructorStandingsResponse>(endpoint);

    if (!response.data.standings?.entries) {
      throw new Error(`No constructor standings found for year ${year}`);
    }

    return response.data.standings.entries.map((entry) => ({
      position: entry.stats.find((s) => s.name === 'rank')?.value || 0,
      points: entry.stats.find((s) => s.name === 'points')?.value || 0,
      wins: entry.stats.find((s) => s.name === 'wins')?.value || 0,
      constructor: {
        id: entry.team.id,
        name: entry.team.name,
        displayName: entry.team.displayName,
        abbreviation: entry.team.abbreviation,
        nationality: '', // Not provided in this API
        color: entry.team.color,
      },
    }));
  }

  /**
   * Gets information about the next upcoming race from the schedule
   * @return {Promise<F1Race | null>} Next race information or null if season is over
   */
  async getNextRace(): Promise<F1Race | null> {
    const year = new Date().getFullYear();
    const endpoint = `/schedule?year=${year}`;
    const response = await this.client.get<F1ScheduleResponse>(endpoint);

    const now = new Date();

    // Find the next race from the schedule
    for (const [, races] of Object.entries(response.data)) {
      const raceList = races as Array<{
        startDate: string;
        endDate: string;
        gPrx: string;
        crct: string;
        completed: boolean;
        status: { id: string; state: string; detail: string };
      }>;
      const race = raceList[0]; // Take the first race of the day
      if (race && new Date(race.startDate) > now && !race.completed) {
        return {
          season: year.toString(),
          round: 0, // Round info not directly available
          name: race.gPrx,
          date: race.startDate.split('T')[0],
          time: race.startDate.split('T')[1]?.replace('Z', ''),
          circuit: {
            id: '',
            name: race.crct,
            country: '',
            locality: '',
          },
        };
      }
    }

    return null;
  }

  /**
   * Gets race results for a specific driver
   * @param {string} driverId - Driver ID
   * @param {number} year - Race year (defaults to current year)
   * @return {Promise<F1RaceResult[]>} Array of race results for the driver
   */
  async getDriverRaceResults(
    driverId: string,
    year: number = new Date().getFullYear()
  ): Promise<F1RaceResult[]> {
    const endpoint = `/race-results?driverId=${driverId}&year=${year}`;
    const response = await this.client.get<F1RaceResultsResponse>(endpoint);

    return response.data.map((result) => ({
      position: result.place,
      points: result.points,
      driver: {
        id: driverId,
        firstName: '',
        lastName: '',
        code: '',
      },
      constructor: {
        id: '',
        name: '',
      },
      grid: result.start,
      laps: result.laps,
      status: 'Finished', // API doesn't provide detailed status
      time: undefined,
      race: {
        name: result.race,
        date: result.date,
      },
    }));
  }

  /**
   * Gets driver statistics for a specific driver
   * @param {string} driverId - Driver ID
   * @return {Promise<F1DriverStats[]>} Array of yearly statistics for the driver
   */
  async getDriverStats(driverId: string): Promise<F1DriverStats[]> {
    const endpoint = `/stats?driverId=${driverId}`;
    const response = await this.client.get<F1StatsResponse>(endpoint);

    return response.data.map((stat) => ({
      year: stat.year,
      rank: stat.rank,
      starts: stat.starts,
      wins: stat.wins,
      poles: stat.poles,
      top5: stat.top5,
      top10: stat.top10,
      points: stat.points,
      avgStart: stat.avgStart,
      avgFinish: stat.avgFinish,
    }));
  }

  /**
   * Gets detailed information about a specific driver
   * @param {string} driverId - Driver ID
   * @return {Promise<F1DriverInfo>} Detailed driver information
   */
  async getDriverInfo(driverId: string): Promise<F1DriverInfo> {
    const endpoint = `/athlete-info?athleteId=${driverId}`;
    const response = await this.client.get<F1DriverInfoResponse>(endpoint);

    return {
      id: response.data.id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      fullName: response.data.fullName,
      displayName: response.data.displayName,
      shortName: response.data.shortName,
      dateOfBirth: response.data.dateOfBirth,
      birthPlace: response.data.birthPlace,
      nationality: response.data.birthPlace?.country || '',
      headshot: response.data.headshot,
      vehicles: response.data.vehicles,
      flag: response.data.flag,
    };
  }

  /**
   * Gets current F1 news
   * @param {number} limit - Number of news entries to retrieve (default: 25)
   * @return {Promise<F1News[]>} Array of F1 news articles
   */
  async getNews(limit = 25): Promise<F1News[]> {
    const endpoint = `/news?limit=${limit}`;
    const response = await this.client.get<F1NewsResponse>(endpoint);

    return response.data.map((article) => ({
      id: article.dataSourceIdentifier,
      headline: article.headline,
      description: article.description,
      link: article.link,
      images: article.images,
    }));
  }

  /**
   * Gets photos for a specific driver
   * @param {string} driverId - Driver ID
   * @param {number} page - Page number for pagination (default: 1)
   * @return {Promise<F1Photo[]>} Array of driver photos
   */
  async getDriverPhotos(driverId: string, page = 1): Promise<F1Photo[]> {
    const endpoint = `/photos?driverId=${driverId}&page=${page}`;
    const response = await this.client.get<F1PhotosResponse>(endpoint);

    return response.data.map((photo) => ({
      href: photo.href,
      imgSrc: photo.imgSrc,
    }));
  }

  /**
   * Gets race schedule for a specific year
   * @param {number} year - Year to get schedule for (defaults to current year)
   * @return {Promise<F1ScheduleEvent[]>} Array of scheduled race events
   */
  async getSchedule(
    year: number = new Date().getFullYear()
  ): Promise<F1ScheduleEvent[]> {
    const endpoint = `/schedule?year=${year}`;
    const response = await this.client.get<F1ScheduleResponse>(endpoint);

    const events: F1ScheduleEvent[] = [];

    for (const [dateKey, races] of Object.entries(response.data)) {
      const raceList = races as Array<{
        startDate: string;
        endDate: string;
        gPrx: string;
        crct: string;
        completed: boolean;
        status: { id: string; state: string; detail: string };
        winner?: string;
      }>;
      raceList.forEach((race) => {
        events.push({
          date: dateKey,
          startDate: race.startDate,
          endDate: race.endDate,
          name: race.gPrx,
          circuit: race.crct,
          status: race.status,
          completed: race.completed,
          winner: race.winner,
        });
      });
    }

    return events.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }
}

// Types for F1 RapidAPI
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
    displayName?: string;
    shortName?: string;
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
    displayName?: string;
    abbreviation?: string;
    nationality: string;
    color?: string;
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
  race?: {
    name: string;
    date: string;
  };
}

export interface F1DriverStats {
  year: number;
  rank: number;
  starts: number;
  wins: number;
  poles: number;
  top5: number;
  top10: number;
  points: number;
  avgStart: string;
  avgFinish: string;
}

export interface F1DriverInfo {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  dateOfBirth: string;
  birthPlace: {
    city: string;
    country?: string;
  };
  nationality: string;
  headshot: string;
  vehicles: Array<{
    number: string;
    manufacturer: string;
    chassis: string;
    engine: string;
    tire: string;
    team: string;
  }>;
  flag: {
    href: string;
    alt: string;
  };
}

export interface F1News {
  id: string;
  headline: string;
  description: string;
  link: string;
  images: Array<{
    name: string;
    width: number;
    height: number;
    alt: string;
    url: string;
  }>;
}

export interface F1Photo {
  href: string;
  imgSrc: string;
}

export interface F1ScheduleEvent {
  date: string;
  startDate: string;
  endDate: string;
  name: string;
  circuit: string;
  status: {
    id: string;
    state: string;
    detail: string;
  };
  completed: boolean;
  winner?: string;
}

// Internal API response types for RapidAPI F1 Motorsport Data
interface F1DriverStandingsResponse {
  standings: {
    id: string;
    name: string;
    displayName: string;
    season: number;
    seasonType: number;
    entries: Array<{
      athlete: {
        id: string;
        uid: string;
        displayName: string;
        abbreviation: string;
        name: string;
        shortName: string;
        flag?: {
          href: string;
          alt: string;
        };
      };
      stats: Array<{
        name: string;
        displayName: string;
        value: number;
      }>;
    }>;
  };
}

interface F1ConstructorStandingsResponse {
  standings: {
    id: string;
    name: string;
    displayName: string;
    season: number;
    seasonType: number;
    entries: Array<{
      team: {
        id: string;
        name: string;
        displayName: string;
        abbreviation: string;
        shortDisplayName: string;
        color: string;
      };
      stats: Array<{
        name: string;
        displayName: string;
        value: number;
      }>;
    }>;
  };
}

interface F1ScheduleResponse {
  [date: string]: Array<{
    startDate: string;
    endDate: string;
    featuredAthletes: string;
    status: {
      id: string;
      state: string;
      detail: string;
    };
    completed: boolean;
    gPrx: string;
    crct: string;
    evLink: string;
    isPostponedOrCanceled: boolean;
    winner?: string;
  }>;
}

type F1RaceResultsResponse = Array<{
  date: string;
  race: string;
  place: number;
  start: number;
  laps: number;
  points: number;
}>;

type F1StatsResponse = Array<{
  year: number;
  rank: number;
  starts: number;
  wins: number;
  poles: number;
  top5: number;
  top10: number;
  points: number;
  avgStart: string;
  avgFinish: string;
}>;

interface F1DriverInfoResponse {
  id: string;
  uid: string;
  guid: string;
  alternateId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  dateOfBirth: string;
  link: string;
  birthPlace: {
    city: string;
    country?: string;
  };
  slug: string;
  headshot: string;
  vehicles: Array<{
    number: string;
    manufacturer: string;
    chassis: string;
    engine: string;
    tire: string;
    team: string;
  }>;
  flag: {
    href: string;
    alt: string;
  };
}

type F1NewsResponse = Array<{
  dataSourceIdentifier: string;
  description: string;
  headline: string;
  link: string;
  images: Array<{
    dataSourceIdentifier: string;
    name: string;
    width: number;
    height: number;
    alt: string;
    id: number;
    credit: string;
    type: string;
    url: string;
  }>;
}>;

type F1PhotosResponse = Array<{
  href: string;
  imgSrc: string;
}>;
