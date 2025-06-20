// server/src/infrastructure/adapters/database/DatabaseTransaction.ts

/**
 * Database Transaction Interface
 */
export interface DatabaseTransaction {
  /**
   * Start the transaction
   */
  start(): Promise<void>;

  /**
   * Execute raw query within transaction
   */
  query<T = any>(sql: string, parameters?: any[]): Promise<T>;

  /**
   * Create record within transaction
   */
  create<T>(tbl_name: string, data: Partial<T>): Promise<T>;

  /**
   * Update record within transaction
   */
  update<T>(tbl_name: string, where: any, data: Partial<T>): Promise<void>;

  /**
   * Delete record within transaction
   */
  delete(tbl_name: string, where: any): Promise<void>;

  /**
   * Find single record within transaction
   */
  findOne<T>(tbl_name: string, where: any): Promise<T | null>;

  /**
   * Find multiple records within transaction
   */
  findMany<T>(tbl_name: string, where?: any, options?: any): Promise<T[]>;

  /**
   * Commit transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback transaction
   */
  rollback(): Promise<void>;

  /**
   * Check if transaction is active
   */
  isActive(): boolean;
}
