import { getFunctions, httpsCallable } from 'firebase/functions';
import { CALLABLE_FUNCTIONS } from '@shared/consts';

// Initialize Firebase Functions
const functions = getFunctions(undefined, 'us-central1');

/**
 * F1 Service for Frontend
 * Provides typed interfaces to F1 Firebase Functions
 */
export class F1Service {
  /**
   * Get current driver championship standings
   * @param year - Championship year (optional, defaults to current year)
   */
  static async getDriverStandings(year?: number) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getDriverStandings
    );
    const result = await fn({ year });
    return result.data;
  }

  /**
   * Get current constructor championship standings
   * @param year - Championship year (optional, defaults to current year)
   */
  static async getConstructorStandings(year?: number) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getConstructorStandings
    );
    const result = await fn({ year });
    return result.data;
  }

  /**
   * Get information about the next upcoming race
   */
  static async getNextRace() {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getNextRace
    );
    const result = await fn();
    return result.data;
  }

  /**
   * Get race schedule for a specific year
   * @param year - Year to get schedule for (optional, defaults to current year)
   */
  static async getSchedule(year?: number) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getSchedule
    );
    const result = await fn({ year });
    return result.data;
  }

  /**
   * Get current F1 news
   * @param limit - Number of articles to retrieve (optional, defaults to 25)
   */
  static async getNews(limit?: number) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getNews
    );
    const result = await fn({ limit });
    return result.data;
  }

  /**
   * Get detailed information about a specific driver
   * @param driverId - Driver ID (required)
   */
  static async getDriverInfo(driverId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getDriverInfo
    );
    const result = await fn({ driverId });
    return result.data;
  }

  /**
   * Get race results for a specific driver
   * @param driverId - Driver ID (required)
   * @param year - Race year (optional, defaults to current year)
   */
  static async getDriverRaceResults(driverId: string, year?: number) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getDriverRaceResults
    );
    const result = await fn({ driverId, year });
    return result.data;
  }

  /**
   * Get statistics for a specific driver
   * @param driverId - Driver ID (required)
   */
  static async getDriverStats(driverId: string) {
    const fn = httpsCallable(
      functions,
      CALLABLE_FUNCTIONS.entertainment.f1.getDriverStats
    );
    const result = await fn({ driverId });
    return result.data;
  }

  /**
   * Get comprehensive F1 data for the main F1 page
   * This combines multiple API calls for efficiency
   */
  static async getF1PageData(year?: number) {
    const currentYear = year || new Date().getFullYear();

    try {
      // Fetch multiple data sources in parallel
      const [driversResult, constructorsResult, nextRaceResult, newsResult] =
        await Promise.allSettled([
          this.getDriverStandings(currentYear),
          this.getConstructorStandings(currentYear),
          this.getNextRace(),
          this.getNews(10), // Get 10 latest news articles
        ]);

      return {
        currentSeason: currentYear.toString(),
        drivers:
          driversResult.status === 'fulfilled'
            ? driversResult.value
            : { success: false, data: [] },
        constructors:
          constructorsResult.status === 'fulfilled'
            ? constructorsResult.value
            : { success: false, data: [] },
        nextRace:
          nextRaceResult.status === 'fulfilled'
            ? nextRaceResult.value
            : { success: false, data: null },
        news:
          newsResult.status === 'fulfilled'
            ? newsResult.value
            : { success: false, data: [] },
      };
    } catch (error) {
      console.error('Error fetching F1 page data:', error);
      throw error;
    }
  }
}

// Export for convenient use
export default F1Service;

// Type definitions for better TypeScript support
export interface F1ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface F1PageData {
  currentSeason: string;
  drivers: F1ServiceResponse<any[]>;
  constructors: F1ServiceResponse<any[]>;
  nextRace: F1ServiceResponse<any>;
  news: F1ServiceResponse<any[]>;
}

// Common driver IDs for easy access
export const POPULAR_DRIVERS = {
  MAX_VERSTAPPEN: '4665',
  LEWIS_HAMILTON: '4524',
  CHARLES_LECLERC: '4712',
  LANDO_NORRIS: '4709',
  GEORGE_RUSSELL: '4713',
  CARLOS_SAINZ: '4710',
  SERGIO_PEREZ: '4697',
  FERNANDO_ALONSO: '4488',
} as const;
