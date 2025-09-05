import { AppError } from '../../../../core/errors';
import { log } from '../../../../core/logger';
import { F1Client } from '../../../../services/entertainment/f1';
import { F1CacheService } from '../../../../services/entertainment/f1Cache';

// Initialize clients
const f1Client = new F1Client();
const f1Cache = new F1CacheService();

/*
 * Get F1 driver or constructor standings for a specific year
 */
export async function getF1Standings(
  year = new Date().getFullYear(),
  type: 'drivers' | 'constructors' = 'drivers'
): Promise<any> {
  try {
    log.info('Getting F1 standings', { year, type });

    // Check cache first
    const cachedData =
      type === 'drivers'
        ? await f1Cache.getDriverStandings(year)
        : await f1Cache.getConstructorStandings(year);

    if (cachedData) {
      f1Cache.logApiCall(
        `/standings-${type}?year=${year}`,
        `get${type}Standings`,
        true
      );
      log.info('F1 standings retrieved from cache', { year, type });
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall(
      `/standings-${type}?year=${year}`,
      `get${type}Standings`,
      false
    );

    const standings =
      type === 'drivers'
        ? await f1Client.getDriverStandings(year)
        : await f1Client.getConstructorStandings(year);

    // Store in cache
    if (type === 'drivers') {
      await f1Cache.setDriverStandings(year, standings);
    } else {
      await f1Cache.setConstructorStandings(year, standings);
    }

    log.info('F1 standings retrieved from API and cached', { year, type });
    return standings;
  } catch (error) {
    log.error('Failed to get F1 standings', { year, type, error });
    throw new AppError(
      'f1-standings-failed',
      `Failed to get F1 ${type} standings`,
      500
    );
  }
}

/**
 * Get F1 next race information
 */
export async function getF1NextRace(): Promise<any> {
  try {
    log.info('Getting F1 next race');

    // Check cache first
    const cachedData = await f1Cache.getNextRace();
    if (cachedData) {
      f1Cache.logApiCall('/next-race', 'getNextRace', true);
      log.info('F1 next race retrieved from cache');
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall('/next-race', 'getNextRace', false);
    const nextRace = await f1Client.getNextRace();

    // Store in cache
    await f1Cache.setNextRace(nextRace);

    log.info('F1 next race retrieved from API and cached');
    return nextRace;
  } catch (error) {
    log.error('Failed to get F1 next race', { error });
    throw new AppError(
      'f1-next-race-failed',
      'Failed to get F1 next race',
      500
    );
  }
}

/*
 * Get F1 race schedule for a specific year
 */
export async function getF1Schedule(
  year = new Date().getFullYear()
): Promise<any> {
  try {
    log.info('Getting F1 schedule', { year });

    // Check cache first
    const cachedData = await f1Cache.getSchedule(year);
    if (cachedData) {
      f1Cache.logApiCall(`/schedule?year=${year}`, 'getSchedule', true);
      log.info('F1 schedule retrieved from cache', { year });
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall(`/schedule?year=${year}`, 'getSchedule', false);
    const schedule = await f1Client.getSchedule(year);

    // Store in cache
    await f1Cache.setSchedule(year, schedule);

    log.info('F1 schedule retrieved from API and cached', { year });
    return schedule;
  } catch (error) {
    log.error('Failed to get F1 schedule', { year, error });
    throw new AppError('f1-schedule-failed', 'Failed to get F1 schedule', 500);
  }
}

/**
 * Get F1 news
 */
export async function getF1News(): Promise<any> {
  try {
    log.info('Getting F1 news');

    // Check cache first
    const cachedData = await f1Cache.getNews();
    if (cachedData) {
      f1Cache.logApiCall('/news', 'getNews', true);
      log.info('F1 news retrieved from cache');
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall('/news', 'getNews', false);
    const news = await f1Client.getNews();

    // Store in cache
    await f1Cache.setNews(news);

    log.info('F1 news retrieved from API and cached');
    return news;
  } catch (error) {
    log.error('Failed to get F1 news', { error });
    throw new AppError('f1-news-failed', 'Failed to get F1 news', 500);
  }
}

/*
 * Get F1 driver information
 */
export async function getF1DriverInfo(
  driverCode: string,
  year = new Date().getFullYear()
): Promise<unknown> {
  try {
    log.info('Getting F1 driver info', { driverCode, year });

    // Check cache first
    const cachedData = await f1Cache.getDriverInfo(driverCode);
    if (cachedData) {
      f1Cache.logApiCall(
        `/driver/${driverCode}?year=${year}`,
        'getDriverInfo',
        true
      );
      log.info('F1 driver info retrieved from cache', { driverCode, year });
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall(
      `/driver/${driverCode}?year=${year}`,
      'getDriverInfo',
      false
    );
    const driverInfo = await f1Client.getDriverInfo(driverCode);

    // Store in cache
    await f1Cache.setDriverInfo(driverCode, driverInfo);

    log.info('F1 driver info retrieved from API and cached', {
      driverCode,
      year,
    });
    return driverInfo;
  } catch (error) {
    log.error('Failed to get F1 driver info', { driverCode, year, error });
    throw new AppError(
      'f1-driver-info-failed',
      'Failed to get F1 driver info',
      500
    );
  }
}

/*
 * Get F1 driver race results
 */
export async function getF1DriverResults(
  driverCode: string,
  year = new Date().getFullYear(),
  limit = 20
): Promise<unknown[]> {
  try {
    log.info('Getting F1 driver results', { driverCode, year, limit });

    // Check cache first
    const cachedData = await f1Cache.getDriverResults(driverCode, year);
    if (cachedData) {
      f1Cache.logApiCall(
        `/driver/${driverCode}/results?year=${year}`,
        'getDriverResults',
        true
      );

      // Apply limit to cached data
      const limitedData = Array.isArray(cachedData)
        ? cachedData.slice(0, limit)
        : [];
      log.info('F1 driver results retrieved from cache', {
        driverCode,
        year,
        count: limitedData.length,
      });
      return limitedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall(
      `/driver/${driverCode}/results?year=${year}`,
      'getDriverResults',
      false
    );
    const results = await f1Client.getDriverRaceResults(driverCode, year);

    // Store in cache (full results)
    await f1Cache.setDriverResults(driverCode, year, results);

    // Apply limit for response
    const limitedResults = Array.isArray(results)
      ? results.slice(0, limit)
      : [];
    log.info('F1 driver results retrieved from API and cached', {
      driverCode,
      year,
      totalResults: Array.isArray(results) ? results.length : 0,
      returnedResults: limitedResults.length,
    });

    return limitedResults;
  } catch (error) {
    log.error('Failed to get F1 driver results', {
      driverCode,
      year,
      limit,
      error,
    });
    throw new AppError(
      'f1-driver-results-failed',
      'Failed to get F1 driver results',
      500
    );
  }
}

/*
 * Get F1 driver statistics
 */
export async function getF1DriverStats(
  driverCode: string,
  year = new Date().getFullYear()
): Promise<unknown[]> {
  try {
    log.info('Getting F1 driver stats', { driverCode, year });

    // Check cache first
    const cachedData = await f1Cache.getDriverStats(driverCode);
    if (cachedData) {
      f1Cache.logApiCall(
        `/driver/${driverCode}/stats?year=${year}`,
        'getDriverStats',
        true
      );
      log.info('F1 driver stats retrieved from cache', { driverCode, year });
      return cachedData;
    }

    // Cache miss - fetch from API
    f1Cache.logApiCall(
      `/driver/${driverCode}/stats?year=${year}`,
      'getDriverStats',
      false
    );
    const stats = await f1Client.getDriverStats(driverCode);

    // Store in cache
    await f1Cache.setDriverStats(driverCode, stats);

    log.info('F1 driver stats retrieved from API and cached', {
      driverCode,
      year,
    });
    return stats;
  } catch (error) {
    log.error('Failed to get F1 driver stats', { driverCode, year, error });
    throw new AppError(
      'f1-driver-stats-failed',
      'Failed to get F1 driver stats',
      500
    );
  }
}

/**
 * Update F1 news cache (for scheduled functions)
 */
export async function updateF1NewsCache(): Promise<void> {
  try {
    log.info('Updating F1 news cache');

    const news = await f1Client.getNews();
    await f1Cache.setNews(news);

    log.info('F1 news cache updated successfully');
  } catch (error) {
    log.error('Failed to update F1 news cache', { error });
    throw new AppError(
      'f1-news-update-failed',
      'Failed to update F1 news cache',
      500
    );
  }
}

/**
 * Update F1 next race cache (for scheduled functions)
 */
export async function updateF1NextRaceCache(): Promise<void> {
  try {
    log.info('Updating F1 next race cache');

    const nextRace = await f1Client.getNextRace();
    await f1Cache.setNextRace(nextRace);

    log.info('F1 next race cache updated successfully');
  } catch (error) {
    log.error('Failed to update F1 next race cache', { error });
    throw new AppError(
      'f1-next-race-update-failed',
      'Failed to update F1 next race cache',
      500
    );
  }
}
