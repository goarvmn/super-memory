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
   * Create record within transaction
   */
  async create<T>(tbl_name: string, data: Partial<T>): Promise<T> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      const repository = this.queryRunner.manager.getRepository(tbl_name);
      const entity = repository.create(data as any);
      const saved = await repository.save(entity);
      return saved as T;
    } catch (error) {
      console.error('Transaction create failed:', error);
      throw error;
    }
  }

  /**
   * Update record within transaction
   */
  async update<T>(tbl_name: string, where: any, data: Partial<T>): Promise<void> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      const repository = this.queryRunner.manager.getRepository(tbl_name);
      await repository.update(where, data as any);
    } catch (error) {
      console.error('Transaction update failed:', error);
      throw error;
    }
  }

  /**
   * Delete record within transaction
   */
  async delete(tbl_name: string, where: any): Promise<void> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      const repository = this.queryRunner.manager.getRepository(tbl_name);
      await repository.delete(where);
    } catch (error) {
      console.error('Transaction delete failed:', error);
      throw error;
    }
  }

  /**
   * Find single record within transaction
   */
  async findOne<T>(tbl_name: string, where: any): Promise<T | null> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      const repository = this.queryRunner.manager.getRepository(tbl_name);
      const result = await repository.findOne({ where });
      return result as T | null;
    } catch (error) {
      console.error('Transaction findOne failed:', error);
      throw error;
    }
  }

  /**
   * Find multiple records within transaction
   */
  async findMany<T>(tbl_name: string, where?: any, options?: any): Promise<T[]> {
    if (!this.isTransactionActive) {
      throw new Error('Transaction not started. Call start() first.');
    }

    try {
      const repository = this.queryRunner.manager.getRepository(tbl_name);

      const findOptions: any = {};
      if (where) findOptions.where = where;
      if (options?.limit) findOptions.take = options.limit;
      if (options?.offset) findOptions.skip = options.offset;
      if (options?.order) findOptions.order = options.order;

      const results = await repository.find(findOptions);
      return results as T[];
    } catch (error) {
      console.error('Transaction findMany failed:', error);
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
