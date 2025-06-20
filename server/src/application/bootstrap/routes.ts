// server/src/application/bootstrap/routes.ts

import { AUTH_ENDPOINTS, BaseApiResponse } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';
import type { AuthController, AuthMiddleware } from '../../modules/auth';
import { DI_TYPES } from '../../shared';
import { container } from '../container';

/**
 * Route Bootstrap Handler
 */
export class RouteBootstrap {
  private env: ReturnType<typeof getEnvironmentConfig>;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.env = getEnvironmentConfig();
    // Get controllers from DI container
    this.authController = container.get<AuthController>(DI_TYPES.AuthController);
    this.authMiddleware = container.get<AuthMiddleware>(DI_TYPES.AuthMiddleware);
  }

  /**
   * Setup health check endpoint
   */
  private setupHealthRoutes(app: express.Application): void {
    app.get('/health', (_req, res) => {
      res.json({
        success: true,
        message: 'GueSense Dashboard API is running',
        timestamp: new Date().toISOString(),
        environment: this.env.NODE_ENV,
        version: '1.0.0',
      });
    });
  }

  /**
   * Setup API routes with dependency injection
   */
  private setupApiRoutes(app: express.Application): void {
    // API routes
    const apiRouter = express.Router();

    // Auth routes (public)
    apiRouter.post(AUTH_ENDPOINTS.LOGIN, this.authController.login);

    // Auth routes (protected)
    apiRouter.post(AUTH_ENDPOINTS.LOGOUT, this.authMiddleware.authenticate, this.authController.logout);
    apiRouter.get(AUTH_ENDPOINTS.VALIDATE, this.authMiddleware.authenticate, this.authController.validate);
    apiRouter.get(AUTH_ENDPOINTS.ME, this.authMiddleware.authenticate, this.authController.me);

    // Mount API router
    app.use('/api', apiRouter);
  }

  /**
   * Setup 404 handler
   */
  private setup404Handler(app: express.Application): void {
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    });
  }

  /**
   * Setup all application routes
   */
  setup(app: express.Application): void {
    this.setupHealthRoutes(app);
    this.setupApiRoutes(app);
    this.setup404Handler(app);
  }
}
