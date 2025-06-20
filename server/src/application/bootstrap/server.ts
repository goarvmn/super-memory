// server/src/application/bootstrap/server.ts

import express from 'express';
import { Container } from 'inversify';
import 'reflect-metadata';
import { DI_TYPES } from '../../shared/types/container';
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
  private databaseBootstrap: DatabaseBootstrap;
  private isInitialized: boolean = false;

  constructor() {
    this.app = express();

    // Setup DI container
    this.container = new Container();
    ServiceBindings.bindAll(this.container);

    // Get DatabaseBootstrap from container
    this.databaseBootstrap = this.container.get<DatabaseBootstrap>(DI_TYPES.DatabaseBootstrap);
  }

  /**
   * Initialize application with all bootstrap components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Initialize database
    await this.databaseBootstrap.initialize();

    // Setup middleware
    new MiddlewareBootstrap().setupAll(this.app);

    // Setup routes
    new RouteBootstrap().setup(this.app);

    // Setup error handling
    new ErrorBootstrap().setup(this.app);

    this.isInitialized = true;
  }

  /**
   * Get Express application
   */
  getApp(): express.Application {
    return this.app;
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
    if (this.isInitialized) {
      await this.databaseBootstrap.shutdown();
      this.isInitialized = false;
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
