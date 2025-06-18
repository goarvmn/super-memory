// server/src/infrastructure/adapters/database/index.ts

// Interfaces
export type { DatabasePort } from './DatabasePort';
export type { DatabaseTransaction } from './DatabaseTransaction';

// Implementations
export { TypeORMAdapter } from './TypeORMAdapter';
export { TypeORMTransaction } from './TypeORMTransaction';
