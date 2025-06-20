// server/src/application/container/ServiceBindings.ts

import { Container } from 'inversify';

// Auth Module
import { DatabasePort, TypeORMAdapter } from 'server/src/infrastructure';
import {
  AuthController,
  AuthMiddleware,
  AuthService,
  IAuthService,
  ISessionStore,
  SessionService,
} from '../../modules/auth';
import { DI_TYPES } from '../../shared';

/**
 * Service Bindings for Dependency Injection
 */
export class ServiceBindings {
  static bindServices(container: Container): void {
    // Auth Services
    container.bind<IAuthService>(DI_TYPES.IAuthService).to(AuthService).inSingletonScope();
    container.bind<ISessionStore>(DI_TYPES.ISessionStore).to(SessionService).inSingletonScope();

    // Auth Controllers & Middleware
    container.bind<AuthController>(DI_TYPES.AuthController).to(AuthController).inSingletonScope();
    container.bind<AuthMiddleware>(DI_TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
  }

  static bindExternalServices(container: Container): void {
    // Database
    container.bind<DatabasePort>(DI_TYPES.Database).to(TypeORMAdapter).inSingletonScope();
  }
}
