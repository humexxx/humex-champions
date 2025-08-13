import { HttpClient, HttpClientConfig } from './httpClient.js';

export interface ClientConfigs {
  polygon: HttpClientConfig;
  f1: HttpClientConfig;
  nba: HttpClientConfig;
  openai: HttpClientConfig;
  anthropic: HttpClientConfig;
}

/**
 * Factory para crear clientes HTTP específicos por API
 * Cada API tiene configuraciones optimizadas para sus limitaciones
 */
export class ApiClientFactory {
  private static configs: ClientConfigs = {
    // POLYGON.IO - Financial Data
    polygon: {
      name: 'Polygon',
      baseURL: 'https://api.polygon.io',
      timeout: 15000,
      retries: 4, // Más retries porque es crítico para portfolio
      retryDelay: 1200, // Más lento por rate limit de 5/min
      exponentialBackoff: true,
      rateLimit: {
        requests: 5,
        per: 'minute',
        burstLimit: 2, // Permite algunas requests rápidas
      },
      headers: {
        'User-Agent': 'Humex-Champions-Portfolio/1.0',
      },
    },

    // F1 DATA API - Racing Data
    f1: {
      name: 'F1-API',
      baseURL: 'https://ergast.com/api/f1',
      timeout: 8000,
      retries: 2, // API gratuita, no tan crítica
      retryDelay: 500,
      exponentialBackoff: false, // Linear backoff
      rateLimit: {
        requests: 10,
        per: 'minute', // Más permisiva
      },
      headers: {
        'User-Agent': 'Humex-Champions-F1/1.0',
        Accept: 'application/json',
      },
    },

    // NBA STATS API - Basketball Data
    nba: {
      name: 'NBA-Stats',
      baseURL: 'https://stats.nba.com/stats',
      timeout: 12000,
      retries: 3,
      retryDelay: 800,
      exponentialBackoff: true,
      rateLimit: {
        requests: 60, // Más generosa
        per: 'minute',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Humex-Champions/1.0)',
        Referer: 'https://stats.nba.com/',
        Accept: 'application/json',
      },
    },

    // OPENAI API - AI Services
    openai: {
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      timeout: 30000, // LLM responses pueden ser lentas
      retries: 2,
      retryDelay: 2000,
      exponentialBackoff: true,
      rateLimit: {
        requests: 50, // TPM limits varían por plan
        per: 'minute',
      },
      headers: {
        'User-Agent': 'Humex-Champions-AI/1.0',
      },
    },

    // ANTHROPIC API - Claude
    anthropic: {
      name: 'Anthropic',
      baseURL: 'https://api.anthropic.com/v1',
      timeout: 45000,
      retries: 2,
      retryDelay: 2500,
      exponentialBackoff: true,
      rateLimit: {
        requests: 30,
        per: 'minute',
      },
      headers: {
        'User-Agent': 'Humex-Champions-AI/1.0',
        'anthropic-version': '2023-06-01',
      },
    },
  };

  // Polygon usa query param para auth, se manejará en el service específico
  static createPolygonClient(): HttpClient {
    return new HttpClient(this.configs.polygon);
  }

  static createF1Client(): HttpClient {
    return new HttpClient(this.configs.f1);
  }

  static createNBAClient(): HttpClient {
    return new HttpClient(this.configs.nba);
  }

  static createOpenAIClient(apiKey: string): HttpClient {
    const config = {
      ...this.configs.openai,
      headers: {
        ...this.configs.openai.headers,
        Authorization: `Bearer ${apiKey}`,
      },
    };
    return new HttpClient(config);
  }

  static createAnthropicClient(apiKey: string): HttpClient {
    const config = {
      ...this.configs.anthropic,
      headers: {
        ...this.configs.anthropic.headers,
        'x-api-key': apiKey,
      },
    };
    return new HttpClient(config);
  }

  static getConfig(client: keyof ClientConfigs): HttpClientConfig {
    return { ...this.configs[client] };
  }

  static updateRateLimit(
    client: keyof ClientConfigs,
    rateLimit: { requests: number; per: 'second' | 'minute' | 'hour' }
  ): void {
    this.configs[client].rateLimit = rateLimit;
  }
}
