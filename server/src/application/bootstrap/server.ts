// server/src/application/bootstrap/server.ts

import express from 'express';
import 'reflect-metadata';
import { setupErrorHandling } from './error';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';

/**
 * Create Express Application
 */
export function createApp(): express.Application {
  const app = express();

  // setup middleware first
  setupMiddleware(app);
  // then setup routes
  setupRoutes(app);
  // finally setup error handling
  setupErrorHandling(app);

  return app;
}
