// server/src/application/bootstrap/index.ts

// Main application bootstrap
export { createApp } from './server';

export {
  setupBodyParsingMiddleware,
  setupCorsMiddleware,
  setupLoggingMiddleware,
  setupMiddleware,
  setupSecurityMiddleware,
} from './middleware';

export { setupErrorHandling } from './error';
export { setupRoutes } from './routes';
