// server/src/application/bootstrap/middleware.ts

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';

/**
 * Setup security middleware
 */
export function setupSecurityMiddleware(app: express.Application): void {
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for API
      crossOriginEmbedderPolicy: false,
    })
  );
}

/**
 * Setup CORS middleware
 */
export function setupCorsMiddleware(app: express.Application): void {
  const env = getEnvironmentConfig();

  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
}

/**
 * Setup body parsing middleware
 */
export function setupBodyParsingMiddleware(app: express.Application): void {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

/**
 * Setup request logging middleware
 */
export function setupLoggingMiddleware(app: express.Application): void {
  const env = getEnvironmentConfig();

  // Request logging (simple production-ready)
  if (env.NODE_ENV !== 'development') {
    app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }
}

/**
 * Setup all middleware in correct order
 */
export function setupMiddleware(app: express.Application): void {
  setupSecurityMiddleware(app);
  setupCorsMiddleware(app);
  setupBodyParsingMiddleware(app);
  setupLoggingMiddleware(app);
}
