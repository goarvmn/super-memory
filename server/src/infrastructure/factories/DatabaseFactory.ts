// server/src/infrastructure/factories/DatabaseFactory.ts

import { DatabasePort, TypeORMAdapter } from '../adapters/database';

/**
 * Database Factory
 */
export class DatabaseFactory {
  /**
   * Create TypeORM database adapter
   */
  static createTypeORMAdapter(): DatabasePort {
    return new TypeORMAdapter();
  }

  /**
   * Create Database instance (exendable for custom database client implementations)
   */
  static create(): DatabasePort {
    return DatabaseFactory.createTypeORMAdapter();
  }
}
