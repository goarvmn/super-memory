// server/src/application/bootstrap/server.ts

import express from 'express';
import 'reflect-metadata';
import { ErrorBootstrap } from './error';
import { MiddlewareBootstrap } from './middleware';
import { RouteBootstrap } from './routes';

/**
 * Application Bootstrap Handler
 */
export class ApplicationBootstrap {
  private app: express.Application;
  private middlewareBootstrap: MiddlewareBootstrap;
  private routeBootstrap: RouteBootstrap;
  private errorBootstrap: ErrorBootstrap;

  constructor() {
    this.app = express();
    this.middlewareBootstrap = new MiddlewareBootstrap();
    this.routeBootstrap = new RouteBootstrap();
    this.errorBootstrap = new ErrorBootstrap();
  }

  /**
   * Initialize application with all bootstrap components
   */
  initialize(): void {
    // Setup middleware
    this.middlewareBootstrap.setupAll(this.app);

    // Setup routes
    this.routeBootstrap.setup(this.app);

    // Setup error handling
    this.errorBootstrap.setup(this.app);
  }

  /**
   * Get Express application
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Create Express Application
   */
  static create(): express.Application {
    const bootstrap = new ApplicationBootstrap();
    bootstrap.initialize();
    return bootstrap.getApp();
  }
}
