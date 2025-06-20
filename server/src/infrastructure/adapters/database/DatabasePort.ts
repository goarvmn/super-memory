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

  /**
   * Create database record
   */
  create<T>(tbl_name: string, data: Partial<T>): Promise<T>;

  /**
   * Update database record
   */
  update<T>(tbl_name: string, where: any, data: Partial<T>): Promise<void>;

  /**
   * Delete database record
   */
  delete(tbl_name: string, where: any): Promise<void>;

  /**
   * Get database record
   */
  findOne<T>(tbl_name: string, where: any): Promise<T | null>;

  /**
   * Get database records
   */
  findMany<T>(tbl_name: string, where?: any, options?: any): Promise<T[]>;
}
