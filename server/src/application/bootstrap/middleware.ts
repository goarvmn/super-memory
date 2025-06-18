// server/src/application/bootstrap/middleware.ts

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';

/**
 * Middleware Bootstrap Handler
 */
export class MiddlewareBootstrap {
  private env: ReturnType<typeof getEnvironmentConfig>;

  constructor() {
    this.env = getEnvironmentConfig();
  }

  /**
   * Setup security middleware
   */
  setupSecurity(app: express.Application): void {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );
  }

  /**
   * Setup CORS middleware
   */
  setupCors(app: express.Application): void {
    app.use(
      cors({
        origin: this.env.ALLOWED_ORIGINS,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
  }

  /**
   * Setup body parsing middleware
   */
  setupBodyParsing(app: express.Application): void {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Setup request logging middleware
   */
  setupLogging(app: express.Application): void {
    if (this.env.NODE_ENV !== 'development') {
      app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  /**
   * Setup all middleware in correct order
   */
  setupAll(app: express.Application): void {
    this.setupSecurity(app);
    this.setupCors(app);
    this.setupBodyParsing(app);
    this.setupLogging(app);
  }
}
