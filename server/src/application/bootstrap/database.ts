// server/src/application/bootstrap/database.ts

import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../infrastructure/adapters/database/DatabasePort';
import { DI_TYPES } from '../../shared/types/container';

/**
 * Database Bootstrap Handler
 */
@injectable()
export class DatabaseBootstrap {
  private isInitialized: boolean = false;

  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Initialize database connection
    await this.database.initialize();

    // Run migrations
    await this.database.runMigrations();

    this.isInitialized = true;
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.isInitialized && this.database.isConnected();
  }

  /**
   * Graceful database shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isInitialized && this.database.isConnected()) {
      await this.database.destroy();
      this.isInitialized = false;
    }
  }
}
