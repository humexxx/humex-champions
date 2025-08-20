import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { F1Client } from './services/entertainment/f1.js';
import { F1CacheService } from './services/entertainment/f1Cache.js';

// Initialize F1 client and cache service
const f1Client = new F1Client();
const f1Cache = new F1CacheService();

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
