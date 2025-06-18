// server/src/infrastructure/adapters/database/TypeORMTransaction.ts

import { QueryRunner } from 'typeorm';
import { DatabaseTransaction } from './DatabaseTransaction';

/**
 * TypeORM implementation of DatabaseTransaction
 */
export class TypeORMTransaction implements DatabaseTransaction {
  private queryRunner: QueryRunner;
  private isTransactionActive: boolean = false;

  constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  /**
   * Start the transaction
   */
  async start(): Promise<void> {
    if (!this.isTransactionActive) {
      await this.queryRunner.startTransaction();
      this.isTransactionActive = true;
    }
  }

  /**
   * Execute query within transaction
   */
  async query<T = any>(sql: string, parameters?: any[]): Promise<T> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      return await this.queryRunner.query(sql, parameters);
    } catch (error) {
      console.error('Transaction query failed:', error);
      throw error;
    }
  }

  /**
   * Commit the transaction
   */
  async commit(): Promise<void> {
    if (!this.isTransactionActive) {
      throw new Error('No active transaction to commit');
    }

    try {
      await this.queryRunner.commitTransaction();
      this.isTransactionActive = false;
    } catch (error) {
      console.error('Transaction commit failed:', error);
      throw error;
    } finally {
      await this.queryRunner.release();
    }
  }

  /**
   * Rollback the transaction
   */
  async rollback(): Promise<void> {
    if (!this.isTransactionActive) {
      throw new Error('No active transaction to rollback');
    }

    try {
      await this.queryRunner.rollbackTransaction();
      this.isTransactionActive = false;
    } catch (error) {
      console.error('Transaction rollback failed:', error);
      throw error;
    } finally {
      await this.queryRunner.release();
    }
  }

  /**
   * Check if transaction is still active
   */
  isActive(): boolean {
    return this.isTransactionActive;
  }
}
