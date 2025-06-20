// server/src/application/container/ServiceBindings.ts

import { Container } from 'inversify';
import { DatabasePort, TypeORMAdapter } from '../../infrastructure/adapters/database';
import {
  AuthController,
  AuthMiddleware,
  AuthService,
  IAuthService,
  ISessionStore,
  SessionService,
} from '../../modules/auth';
import { DI_TYPES } from '../../shared/types/container';
import { DatabaseBootstrap } from '../bootstrap/database';

/**
 * Service Bindings for Dependency Injection
 */
export class ServiceBindings {
  static bindInfrastructure(container: Container): void {
    // Database
    container.bind<DatabasePort>(DI_TYPES.Database).to(TypeORMAdapter).inSingletonScope();
  }

  static bindBootstrap(container: Container): void {
    // Bootstrap Services
    container.bind<DatabaseBootstrap>(DI_TYPES.DatabaseBootstrap).to(DatabaseBootstrap).inSingletonScope();
  }

  static bindAuth(container: Container): void {
    // Auth Services
    container.bind<IAuthService>(DI_TYPES.IAuthService).to(AuthService).inSingletonScope();
    container.bind<ISessionStore>(DI_TYPES.ISessionStore).to(SessionService).inSingletonScope();

    // Auth Controllers & Middleware
    container.bind<AuthController>(DI_TYPES.AuthController).to(AuthController).inSingletonScope();
    container.bind<AuthMiddleware>(DI_TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
  }

  /**
   * Bind all services to container
   */
  static bindAll(container: Container): void {
    this.bindInfrastructure(container);
    this.bindBootstrap(container);
    this.bindAuth(container);
  }
}
