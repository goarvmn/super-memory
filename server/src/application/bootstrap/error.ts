// server/src/application/bootstrap/error.ts

import { BaseApiResponse } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';

/**
 * Error Handling Bootstrap
 */
export class ErrorBootstrap {
  private env: ReturnType<typeof getEnvironmentConfig>;

  constructor() {
    this.env = getEnvironmentConfig();
  }

  /**
   * Setup global error handling middleware
   */
  setup(app: express.Application): void {
    // Global error handler
    app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: this.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    });
  }
}
