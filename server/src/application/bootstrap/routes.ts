// server/src/application/bootstrap/routes.ts

import { AUTH_ENDPOINTS } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';
import type { AuthController, AuthMiddleware } from '../../modules/auth';
import { DI_TYPES } from '../../shared/types/container';
import { container } from '../container';

/**
 * Setup health check endpoint
 */
function setupHealthRoutes(app: express.Application): void {
  const env = getEnvironmentConfig();

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'GueSense Dashboard API is running',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  });
}

/**
 * Setup API routes with dependency injection
 */
function setupApiRoutes(app: express.Application): void {
  // Get controllers from DI container
  const authController = container.get<AuthController>(DI_TYPES.AuthController);
  const authMiddleware = container.get<AuthMiddleware>(DI_TYPES.AuthMiddleware);

  // API routes
  const apiRouter = express.Router();

  // Auth routes (public)
  apiRouter.post(AUTH_ENDPOINTS.LOGIN, authController.login);

  // Auth routes (protected)
  apiRouter.post(AUTH_ENDPOINTS.LOGOUT, authMiddleware.authenticate, authController.logout);
  apiRouter.get(AUTH_ENDPOINTS.VALIDATE, authMiddleware.authenticate, authController.validate);
  apiRouter.get(AUTH_ENDPOINTS.ME, authMiddleware.authenticate, authController.me);

  // Mount API router
  app.use('/api', apiRouter);
}

/**
 * Setup 404 handler
 */
function setup404Handler(app: express.Application): void {
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Setup all application routes
 */
export function setupRoutes(app: express.Application): void {
  setupHealthRoutes(app);
  setupApiRoutes(app);
  setup404Handler(app);
}
