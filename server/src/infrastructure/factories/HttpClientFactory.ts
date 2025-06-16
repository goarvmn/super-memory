// server/src/infrastructure/factories/HttpClientFactory.ts

import { AxiosAdapter } from '../adapters/http-client/AxiosAdapter';
import { HttpClientConfig, HttpClientPort } from '../adapters/http-client/HttpClientPort';

/**
 * HTTP Client Factory
 */
export class HttpClientFactory {
  /**
   * Create HTTP client instance (exendable for custom http client implementations)
   */
  static create(config: HttpClientConfig): HttpClientPort {
    return new AxiosAdapter(config);
  }

  /**
   * Create HTTP client for GOA Service
   */
  static createGOAServiceClient(): HttpClientPort {
    const config: HttpClientConfig = {
      baseURL: process.env.GOA_SERVICE_URL || 'https://goa-service.example.com',
      timeout: 15000,
      headers: {
        'User-Agent': 'GueSenseDashboard/1.0',
      },
    };

    return this.create(config);
  }

  /**
   * Create HTTP client for Guesense Service
   */
  static createGuesenseServiceClient(): HttpClientPort {
    const config: HttpClientConfig = {
      baseURL: process.env.GS_SERVICE_URL || 'https://guesense-service.example.com',
      timeout: 30000,
      headers: {
        'User-Agent': 'GueSenseDashboard/1.0',
      },
    };

    return this.create(config);
  }

  /**
   * Create generic HTTP client with custom config
   */
  static createWithConfig(config: HttpClientConfig): HttpClientPort {
    return this.create(config);
  }
}
