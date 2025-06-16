// server/src/shared/types/container.ts

/**
 * Dependency Injection Type Symbols
 */

export const DI_TYPES = {
  IAuthService: Symbol.for('IAuthService'),
  ISessionStore: Symbol.for('ISessionStore'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  AuthController: Symbol.for('AuthController'),
} as const;
