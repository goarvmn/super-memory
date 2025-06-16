// server/src/modules/auth/index.ts

// Export types (interface contracts)
export type { IAuthService, ISessionStore, SessionData } from './interfaces';

// Re-export services
export { AuthService } from './services/AuthService';
export { SessionService } from './services/SessionService';

// Re-export middleware
export { AuthMiddleware } from './middleware/AuthMiddleware';
export type { AuthenticatedRequest } from './middleware/AuthMiddleware';

// Re-export controller
export { AuthController } from './controllers/AuthController';

// Re-export types & configuration
export { AuthConfig } from './config/AuthConfig';
export { UserRole, UserType } from './types/AuthTypes';
export type { AuthOptions, TokenPayload } from './types/AuthTypes';
