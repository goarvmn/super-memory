// server/src/infrastructure/adapters/database/DatabaseTransaction.ts

/**
 * Database Transaction Interface
 */
export interface DatabaseTransaction {
  /**
   * Execute query within transaction
   */
  query<T = any>(sql: string, parameters?: any[]): Promise<T>;

  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;

  /**
   * Check if transaction is still active
   */
  isActive(): boolean;
}
