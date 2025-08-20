import { FIRESTORE_PATHS } from '@shared/consts';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * F1 Cache Service
 * Manages caching of F1 data in Firestore to reduce API calls
 */
export class F1CacheService {
  private db: Firestore;

  constructor() {
    this.db = getFirestore();
  }

  /**
   * Cache configuration for different data types
   */
  private readonly CACHE_CONFIG = {
    DRIVER_STANDINGS: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (Mondays after race Sunday)
    CONSTRUCTOR_STANDINGS: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (Mondays after race Sunday)
    SCHEDULE: { ttl: 30 * 24 * 60 * 60 * 1000 }, // 1 month
    NEWS: { ttl: 365 * 24 * 60 * 60 * 1000 }, // 1 year (only scheduled updates)
    DRIVER_INFO: { ttl: 6 * 30 * 24 * 60 * 60 * 1000 }, // 6 months
    DRIVER_STATS: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
    DRIVER_RESULTS: { ttl: 6 * 30 * 24 * 60 * 60 * 1000 }, // 6 months
    NEXT_RACE: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 1 week (Mondays after race Sunday)
  };

  /**
   * Generic cache getter with TTL check
   * @param {string} path Firestore document path
   * @param {string} cacheType Type of cache for TTL configuration
   * @return {Promise<*>} Cached data or null if expired/missing
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

      const cachedAt = data.cachedAt?.toDate();
      const ttl = this.CACHE_CONFIG[cacheType].ttl;

      if (!cachedAt || Date.now() - cachedAt.getTime() > ttl) {
        logger.debug(
          `Cache expired: ${path} (cached ${cachedAt}, TTL: ${ttl}ms)`
        );
        return null;
      }

      logger.debug(`Cache hit: ${path} (cached ${cachedAt})`);
      return data.payload as T;
    } catch (error) {
      logger.error(`Error reading cache at ${path}:`, error);
      return null;
    }
  }

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
   * Generic cache setter
   * @param {string} path Firestore document path
   * @param {*} data Data to cache
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

  /**
   * Driver Standings Cache
   * @param {number} year Championship year
   * @return {Promise<*>} Cached driver standings or null
   */
  async getDriverStandings(year: number): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_STANDINGS(year);
    return this.getCachedData<unknown[]>(path, 'DRIVER_STANDINGS');
  }

  async setDriverStandings(year: number, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_STANDINGS(year);
    await this.setCachedData(path, data);
  }

  /**
   * Constructor Standings Cache
   * @param {number} year Championship year
   * @return {Promise<*>} Cached constructor standings or null
   */
  async getConstructorStandings(year: number): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.CONSTRUCTOR_STANDINGS(year);
    return this.getCachedData<unknown[]>(path, 'CONSTRUCTOR_STANDINGS');
  }

  async setConstructorStandings(year: number, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.CONSTRUCTOR_STANDINGS(year);
    await this.setCachedData(path, data);
  }

  /**
   * Schedule Cache
   * @param {number} year Championship year
   * @return {Promise<*>} Cached schedule or null
   */
  async getSchedule(year: number): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.SCHEDULE(year);
    return this.getCachedData<unknown[]>(path, 'SCHEDULE');
  }

  async setSchedule(year: number, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.SCHEDULE(year);
    await this.setCachedData(path, data);
  }

  /**
   * News Cache
   * @return {Promise<*>} Cached news or null
   */
  async getNews(): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.NEWS();
    return this.getCachedData<unknown[]>(path, 'NEWS');
  }

  async setNews(data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.NEWS();
    await this.setCachedData(path, data);
  }

  /**
   * Store individual news articles for daily updates
   * @param {Array} articles News articles to store
   * @return {Promise<void>} Promise that resolves when articles are stored
   */
  async storeNewsArticles(articles: unknown[]): Promise<void> {
    const batch = this.db.batch();
    const timestamp = new Date();

    for (const article of articles) {
      const articleData = article as Record<string, unknown> & { id: string };
      const articlePath = FIRESTORE_PATHS.THIRD_PARTY.F1.NEWS_ARTICLE(
        articleData.id
      );
      batch.set(this.db.doc(articlePath), {
        ...articleData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Also update the main news cache
    const newsPath = FIRESTORE_PATHS.THIRD_PARTY.F1.NEWS();
    batch.set(this.db.doc(newsPath), {
      payload: articles,
      cachedAt: timestamp,
      metadata: { source: 'daily-task', apiCalled: true },
    });

    await batch.commit();
    logger.info(`Stored ${articles.length} F1 news articles`);
  }

  /**
   * Driver Info Cache
   * @param {string} driverId Driver ID
   * @return {Promise<*>} Cached driver info or null
   */
  async getDriverInfo(driverId: string): Promise<unknown | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_INFO(driverId);
    return this.getCachedData<unknown>(path, 'DRIVER_INFO');
  }

  async setDriverInfo(driverId: string, data: unknown): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_INFO(driverId);
    await this.setCachedData(path, data);
  }

  /**
   * Driver Stats Cache
   * @param {string} driverId Driver ID
   * @return {Promise<*>} Cached driver stats or null
   */
  async getDriverStats(driverId: string): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_STATS(driverId);
    return this.getCachedData<unknown[]>(path, 'DRIVER_STATS');
  }

  async setDriverStats(driverId: string, data: unknown[]): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_STATS(driverId);
    await this.setCachedData(path, data);
  }

  /**
   * Driver Race Results Cache
   * @param {string} driverId Driver ID
   * @param {number} year Race year
   * @return {Promise<*>} Cached driver results or null
   */
  async getDriverResults(
    driverId: string,
    year: number
  ): Promise<unknown[] | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_RESULTS(driverId, year);
    return this.getCachedData<unknown[]>(path, 'DRIVER_RESULTS');
  }

  async setDriverResults(
    driverId: string,
    year: number,
    data: unknown[]
  ): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.DRIVER_RESULTS(driverId, year);
    await this.setCachedData(path, data);
  }

  /**
   * Next Race Cache (special case - stored as metadata)
   * @return {Promise<*>} Cached next race or null
   */
  async getNextRace(): Promise<unknown | null> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.CACHE_META_ITEM('next-race');
    return this.getCachedData<unknown>(path, 'NEXT_RACE');
  }

  async setNextRace(data: unknown): Promise<void> {
    const path = FIRESTORE_PATHS.THIRD_PARTY.F1.CACHE_META_ITEM('next-race');
    await this.setCachedData(path, data);
  }

  /**
   * Utility method to log API usage
   * @param {string} endpoint API endpoint called
   * @param {string} method Method name
   * @param {boolean} cached Whether data was served from cache
   * @return {void} No return value
   */
  logApiCall(endpoint: string, method: string, cached: boolean): void {
    if (cached) {
      logger.info(`🟢 F1 Data served from cache: ${method}`, {
        endpoint,
        cached: true,
      });
    } else {
      logger.warn(`🔴 F1 API called: ${method}`, {
        endpoint,
        cached: false,
        cost: 'API_REQUEST',
      });
    }
  }
}
