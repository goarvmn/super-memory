// server/src/infrastructure/adapters/database/TypeORMAdapter.ts

import { injectable } from 'inversify';
import { DataSource } from 'typeorm';
import { getTypeORMConfig } from '../../config/typeorm';
import { DatabasePort } from './DatabasePort';
import { DatabaseTransaction } from './DatabaseTransaction';
import { TypeORMTransaction } from './TypeORMTransaction';

@injectable()
export class TypeORMAdapter implements DatabasePort {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource(getTypeORMConfig());
  }

  async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  async destroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  isConnected(): boolean {
    return this.dataSource.isInitialized;
  }

  async runMigrations(): Promise<void> {
    await this.dataSource.runMigrations();
  }

  async undoLastMigration(): Promise<void> {
    await this.dataSource.undoLastMigration();
  }

  async query<T = any>(sql: string, parameters?: any[]): Promise<T> {
    return await this.dataSource.query(sql, parameters);
  }

  async startTransaction(): Promise<DatabaseTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const transaction = new TypeORMTransaction(queryRunner);
    await transaction.start();

    return transaction;
  }

  async create<T>(tbl_name: string, data: Partial<T>): Promise<T> {
    const repository = this.dataSource.getRepository(tbl_name);
    const entity = repository.create(data as any);
    const saved = await repository.save(entity);
    return saved as T;
  }

  async update<T>(tbl_name: string, where: any, data: Partial<T>): Promise<void> {
    const repository = this.dataSource.getRepository(tbl_name);
    await repository.update(where, data as any);
  }

  async delete(tbl_name: string, where: any): Promise<void> {
    const repository = this.dataSource.getRepository(tbl_name);
    await repository.delete(where);
  }

  async findOne<T>(tbl_name: string, where: any): Promise<T | null> {
    const repository = this.dataSource.getRepository(tbl_name);
    const result = await repository.findOne({ where });
    return result as T | null;
  }

  async findMany<T>(tbl_name: string, where?: any, options?: any): Promise<T[]> {
    const repository = this.dataSource.getRepository(tbl_name);

    const findOptions: any = {};
    if (where) findOptions.where = where;
    if (options?.limit) findOptions.take = options.limit;
    if (options?.offset) findOptions.skip = options.offset;
    if (options?.order) findOptions.order = options.order;

    const results = await repository.find(findOptions);
    return results as T[];
  }
}
