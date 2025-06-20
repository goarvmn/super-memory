// server/src/infrastructure/index.ts

// HTTP Client Adapters
export { AxiosAdapter } from './adapters/http-client';
export type { HttpClientConfig, HttpClientPort, HttpRequest, HttpResponse } from './adapters/http-client';

// Database Adapters
export { TypeORMAdapter } from './adapters/database';
export type { DatabasePort, DatabaseTransaction } from './adapters/database';

// Factories
export { HttpClientFactory } from './factories';
export { DatabaseFactory } from './factories/DatabaseFactory';

// Config
export { getDatabaseConfig } from './config/database';
export { getEnvironmentConfig } from './config/environment';
