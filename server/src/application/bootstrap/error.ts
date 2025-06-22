// server/src/application/bootstrap/error.ts

import { BaseApiResponse } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';

/**
 * Error context for structured logging
 */
interface ErrorLogContext {
  correlationId?: string;
  userId?: string;
  method?: string;
  path?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Enhanced Error Handling Bootstrap with Structured Logging
 */
export class ErrorBootstrap {
  private env: ReturnType<typeof getEnvironmentConfig>;

  constructor() {
    this.env = getEnvironmentConfig();
  }

  /**
   * Parse error to determine appropriate response
   */
  private parseError(error: Error): {
    statusCode: number;
    errorCode: string;
    message: string;
  } {
    // handle known error types
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        message: error.message,
      };
    }

    if (error.name === 'UnauthorizedError') {
      return {
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
    }

    if (error.name === 'ForbiddenError') {
      return {
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        message: 'Access denied',
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        message: error.message || 'Resource not found',
      };
    }

    if (error.name === 'ConflictError') {
      return {
        statusCode: 409,
        errorCode: 'CONFLICT',
        message: error.message || 'Resource conflict',
      };
    }

    // handle database errors
    if (error.message.includes('ECONNREFUSED')) {
      return {
        statusCode: 503,
        errorCode: 'DATABASE_CONNECTION_ERROR',
        message: 'Database connection failed',
      };
    }

    // default to internal server error
    return {
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: this.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    };
  }

  /**
   * Enhanced error logging with context
   */
  private logError(error: Error, context: ErrorLogContext = {}, errorType: string = 'UNHANDLED_ERROR'): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: errorType,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      environment: this.env.NODE_ENV,
    };

    if (this.env.NODE_ENV === 'production') {
      // we can implement logging service here
      console.error(JSON.stringify(logEntry));
    } else {
      console.error('Error occurred:', logEntry);
    }

    // Sample winston integration
    // this.logger?.error('Application error', logEntry);
  }

  /**
   * Setup global error handling middleware
   */
  setup(app: express.Application): void {
    // catch unmatched routes
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!res.headersSent) {
        const errorContext: ErrorLogContext = {
          correlationId: req.headers['x-correlation-id'] as string,
          method: req.method,
          path: req.originalUrl,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        };

        this.logError(new Error(`Route not found: ${req.method} ${req.originalUrl}`), errorContext, 'ROUTE_NOT_FOUND');

        res.status(404).json({
          success: false,
          error: {
            code: 'ROUTE_NOT_FOUND',
            message: `The requested endpoint ${req.method} ${req.originalUrl} was not found`,
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
      } else {
        next();
      }
    });

    // global error handler
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!res.headersSent) {
        const errorContext: ErrorLogContext = {
          correlationId: req.headers['x-correlation-id'] as string,
          // @ts-ignore (user might be attached by auth middleware)
          userId: req.user?.id,
          method: req.method,
          path: req.originalUrl,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
        };

        // log the error with context
        this.logError(error, errorContext);

        // determine error code and status
        const { statusCode, errorCode, message } = this.parseError(error);

        res.status(statusCode).json({
          success: false,
          error: {
            code: errorCode,
            message: message,
            ...(this.env.NODE_ENV === 'development' && {
              stack: error.stack,
              details: error.message,
            }),
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
      } else {
        next(error);
      }
    });
  }
}
