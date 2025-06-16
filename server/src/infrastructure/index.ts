// server/src/infrastructure/index.ts

// HTTP Client Adapters
export { AxiosAdapter } from './adapters/http-client';
export type { HttpClientConfig, HttpClientPort, HttpRequest, HttpResponse } from './adapters/http-client';

// Factories
export { HttpClientFactory } from './factories';

// Config
export { getEnvironmentConfig } from './config/environment';
