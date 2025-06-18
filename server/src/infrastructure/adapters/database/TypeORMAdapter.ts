// server/src/infrastructure/adapters/database/TypeORMAdapter.ts

import { DataSource } from 'typeorm';
import { getTypeORMConfig } from '../../config/database';
import { DatabasePort } from './DatabasePort';
import { DatabaseTransaction } from './DatabaseTransaction';
import { TypeORMTransaction } from './TypeORMTransaction';

/**
 * TypeORM implementation of DatabasePort
 */
export class TypeORMAdapter implements DatabasePort {
  private dataSource: DataSource;
  private isInitialized: boolean = false;

  constructor() {
    this.dataSource = new DataSource(getTypeORMConfig());
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.dataSource.initialize();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close database connection
   */
  async destroy(): Promise<void> {
    try {
      if (this.isInitialized && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Database connection close failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.isInitialized && this.dataSource.isInitialized;
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected. Call initialize() first.');
      }

      await this.dataSource.runMigrations();
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Database migrations failed:', error);
      throw error;
    }
  }

  /**
   * Revert last migration
   */
  async undoLastMigration(): Promise<void> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected. Call initialize() first.');
      }

      await this.dataSource.undoLastMigration();
      console.log('Last migration reverted successfully');
    } catch (error) {
      console.error('Migration revert failed:', error);
      throw error;
    }
  }

  /**
   * Execute raw query
   */
  async query<T = any>(sql: string, parameters?: any[]): Promise<T> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected. Call initialize() first.');
      }

      return await this.dataSource.query(sql, parameters);
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  /**
   * Start database transaction
   */
  async startTransaction(): Promise<DatabaseTransaction> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected. Call initialize() first.');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const transaction = new TypeORMTransaction(queryRunner);
      await transaction.start();

      return transaction;
    } catch (error) {
      console.error('Transaction start failed:', error);
      throw error;
    }
  }
}
