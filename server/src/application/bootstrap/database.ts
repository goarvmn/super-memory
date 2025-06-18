// server/src/application/bootstrap/database.ts

import { DatabasePort } from '../../infrastructure/adapters/database';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';
import { DatabaseFactory } from '../../infrastructure/factories/DatabaseFactory';

/**
 * Database Bootstrap Handler
 */
export class DatabaseBootstrap {
  private database: DatabasePort;
  private env: ReturnType<typeof getEnvironmentConfig>;
  private isInitialized: boolean = false;

  constructor() {
    this.env = getEnvironmentConfig();
    this.database = DatabaseFactory.create();
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      // Initialize database connection
      await this.database.initialize();

      await this.runMigrations();

      this.isInitialized = true;
    } catch (error) {
      console.error('Database bootstrap failed:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run migrations (always run - no auto-sync policy)
   */
  private async runMigrations(): Promise<void> {
    try {
      await this.database.runMigrations();
    } catch (error) {
      console.error('Database migrations failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.isInitialized && this.database.isConnected();
  }

  /**
   * Get database instance for advanced operations
   */
  getDatabase(): DatabasePort {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.database;
  }

  /**
   * Graceful database shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.isInitialized && this.database.isConnected()) {
        await this.database.destroy();
        this.isInitialized = false;
      } else {
        console.log('Database already shut down');
      }
    } catch (error) {
      console.error('Database shutdown failed:', error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ status: string; connected: boolean; timestamp: string }> {
    try {
      if (!this.isInitialized) {
        return {
          status: 'error',
          connected: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Simple health check query
      await this.database.query('SELECT 1');

      return {
        status: 'healthy',
        connected: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        connected: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Development utilities
   */
  async developmentUtils(): Promise<{
    revertLastMigration: () => Promise<void>;
    runMigrations: () => Promise<void>;
  }> {
    if (this.env.NODE_ENV !== 'development') {
      throw new Error('Development utilities only available in development mode');
    }

    return {
      revertLastMigration: async () => {
        console.log('Reverting last migration...');
        await this.database.undoLastMigration();
        console.log('Migration reverted successfully');
      },
      runMigrations: async () => {
        console.log('Running migrations manually...');
        await this.database.runMigrations();
        console.log('Migrations completed successfully');
      },
    };
  }
}
