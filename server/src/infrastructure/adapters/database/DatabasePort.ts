// server/src/infrastructure/adapters/database/DatabasePort.ts

import { DatabaseTransaction } from './DatabaseTransaction';

/**
 * Database Connection Port
 */
export interface DatabasePort {
  /**
   * Initialize database connection
   */
  initialize(): Promise<void>;

  /**
   * Close database connection
   */
  destroy(): Promise<void>;

  /**
   * Check if database is connected
   */
  isConnected(): boolean;

  /**
   * Run database migrations
   */
  runMigrations(): Promise<void>;

  /**
   * Revert last migration
   */
  undoLastMigration(): Promise<void>;

  /**
   * Execute raw query (for complex operations)
   */
  query<T = any>(sql: string, parameters?: any[]): Promise<T>;

  /**
   * Start database transaction
   */
  startTransaction(): Promise<DatabaseTransaction>;
}
