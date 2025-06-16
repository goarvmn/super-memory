// server/src/application/bootstrap/error.ts

import { BaseApiResponse } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';

/**
 * Setup global error handling middleware
 */
export function setupErrorHandling(app: express.Application): void {
  const env = getEnvironmentConfig();

  // Global error handler
  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      },
      timestamp: new Date().toISOString(),
    } as BaseApiResponse<never>);
  });
}
