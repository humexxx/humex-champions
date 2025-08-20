import { logger } from 'firebase-functions';

export interface RateLimitConfig {
  requests: number;
  per: 'second' | 'minute' | 'hour';
  burstLimit?: number;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  headers?: Record<string, string>;
  rateLimit?: RateLimitConfig;
  name?: string; // Para logging identificable
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  fromCache?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  retryAfter?: number;
  isRateLimit?: boolean;
  isServerError?: boolean;
}

// Rate limiter por cliente
class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const windowMs = this.getWindowMs();

    // Limpiar requests antiguos
    this.requests = this.requests.filter((time) => now - time < windowMs);

    if (this.requests.length >= this.config.requests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = windowMs - (now - oldestRequest);

      if (waitTime > 0) {
        logger.debug(`Rate limit reached, waiting ${waitTime}ms`);
        await this.delay(waitTime);
      }
    }

    this.requests.push(now);
  }

  private getWindowMs(): number {
    switch (this.config.per) {
      case 'second':
        return 1000;
      case 'minute':
        return 60 * 1000;
      case 'hour':
        return 60 * 60 * 1000;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private exponentialBackoff: boolean;
  private defaultHeaders: Record<string, string>;
  private rateLimiter?: RateLimiter;
  private name: string;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.exponentialBackoff = config.exponentialBackoff ?? true;
    this.name = config.name || 'HttpClient';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Humex-Champions/1.0',
      ...config.headers,
    };

    if (config.rateLimit) {
      this.rateLimiter = new RateLimiter(config.rateLimit);
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  private createApiError(
    message: string,
    status?: number,
    response?: Response
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.isRateLimit = status === 429;
    error.isServerError = status ? status >= 500 : false;

    // Parse Retry-After header for rate limiting
    if (response && status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        error.retryAfter = parseInt(retryAfter) * 1000; // Convert to ms
      }
    }

    return error;
  }

  private shouldRetry(error: ApiError, attempt: number): boolean {
    // Don't retry client errors (4xx except 429)
    if (
      error.status &&
      error.status >= 400 &&
      error.status < 500 &&
      !error.isRateLimit
    ) {
      return false;
    }

    // Always retry network errors and 5xx
    if (!error.status || error.isServerError) {
      return attempt < this.retries;
    }

    // Retry rate limits with backoff
    if (error.isRateLimit) {
      return attempt < this.retries;
    }

    return false;
  }

  private calculateDelay(attempt: number, error?: ApiError): number {
    // Use Retry-After header if available
    if (error?.retryAfter) {
      return error.retryAfter;
    }

    // Exponential backoff or linear
    const baseDelay = this.retryDelay;
    return this.exponentialBackoff
      ? baseDelay * Math.pow(2, attempt)
      : baseDelay * (attempt + 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: ApiError | undefined;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Rate limiting
    if (this.rateLimiter) {
      await this.rateLimiter.waitIfNeeded();
    }

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        logger.debug(
          `[${this.name}] ${requestOptions.method || 'GET'} ${endpoint}${attempt > 0 ? ` (retry ${attempt})` : ''}`
        );

        const response = await this.fetchWithTimeout(url, requestOptions);

        if (!response.ok) {
          const error = this.createApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response
          );

          if (!this.shouldRetry(error, attempt)) {
            throw error;
          }

          lastError = error;
          const delayMs = this.calculateDelay(attempt, error);
          logger.warn(
            `[${this.name}] Request failed, retrying in ${delayMs}ms: ${error.message}`
          );
          await this.delay(delayMs);
          continue;
        }

        logger.debug(`[${this.name}] Success: ${response.status} ${endpoint}`);

        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        const apiError =
          error instanceof Error
            ? this.createApiError(error.message)
            : this.createApiError('Unknown error');

        if (!this.shouldRetry(apiError, attempt)) {
          logger.error(`[${this.name}] Request failed:`, {
            url: endpoint,
            method: requestOptions.method || 'GET',
            status: apiError.status,
            error: apiError.message,
          });
          throw apiError;
        }

        lastError = apiError;
        const delayMs = this.calculateDelay(attempt);
        await this.delay(delayMs);
      }
    }

    throw lastError || new Error('Request failed');
  }

  async get<T = unknown>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}
