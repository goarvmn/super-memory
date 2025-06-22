// server/src/application/bootstrap/server.ts

import express from 'express';
import { Container } from 'inversify';
import 'reflect-metadata';
import { DI_TYPES } from '../../shared';
import { ServiceBindings } from '../container/ServiceBindings';
import { DatabaseBootstrap } from './database';
import { ErrorBootstrap } from './error';
import { MiddlewareBootstrap } from './middleware';
import { RouteBootstrap } from './routes';

/**
 * Application Bootstrap Handler
 */
export class ApplicationBootstrap {
  private app: express.Application;
  private container: Container;
  private isInitialized: boolean = false;

  // Lazy-load database bootstrap
  private get databaseBootstrap(): DatabaseBootstrap {
    return this.container.get<DatabaseBootstrap>(DI_TYPES.DatabaseBootstrap);
  }

  constructor() {
    this.app = express();

    // Setup DI container
    this.container = new Container();
    ServiceBindings.bindAll(this.container);
  }

  /**
   * Initialize application with all bootstrap components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Application...');

      // initialize database connection
      await this.databaseBootstrap.initialize();

      // setup middleware
      const middlewareBootstrap = new MiddlewareBootstrap(this.container);
      middlewareBootstrap.setupAll(this.app);

      // setup routes with DI container injected
      const routeBootstrap = new RouteBootstrap(this.container);
      routeBootstrap.setup(this.app);

      // etup error handling
      const errorBootstrap = new ErrorBootstrap();
      errorBootstrap.setup(this.app);

      this.isInitialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get Express application
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get DI Container
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Check if database is connected
   */
  isDatabaseConnected(): boolean {
    return this.databaseBootstrap.isConnected();
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down application...');

      // Shutdown database connections
      await this.databaseBootstrap.shutdown();

      this.isInitialized = false;
      console.log('✅ Application shutdown completed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Create and initialize Express Application
   */
  static async create(): Promise<ApplicationBootstrap> {
    const bootstrap = new ApplicationBootstrap();
    await bootstrap.initialize();
    return bootstrap;
  }
}
