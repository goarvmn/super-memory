// server/src/shared/types/container.ts

export const DI_TYPES = {
  // Infrastructure
  Database: Symbol.for('Database'),

  // Bootstrap
  DatabaseBootstrap: Symbol.for('DatabaseBootstrap'),

  // Auth Module
  IAuthService: Symbol.for('IAuthService'),
  ISessionStore: Symbol.for('ISessionStore'),
  AuthController: Symbol.for('AuthController'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),

  // Merchant Module
  IMerchantRepository: Symbol.for('IMerchantRepository'),
  IGroupRepository: Symbol.for('IGroupRepository'),
};
