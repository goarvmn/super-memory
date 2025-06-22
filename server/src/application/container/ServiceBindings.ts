// server/src/application/container/ServiceBindings.ts

import { Container } from 'inversify';
import {
  GroupController,
  GroupRepository,
  GroupService,
  IGroupRepository,
  IGroupService,
  IMerchantRepository,
  IMerchantService,
  MerchantController,
  MerchantRepository,
  MerchantService,
} from 'server/src/modules/merchant';
import { DatabasePort, TypeORMAdapter } from '../../infrastructure/adapters/database';
import {
  AuthController,
  AuthMiddleware,
  AuthService,
  IAuthService,
  ISessionStore,
  SessionService,
} from '../../modules/auth';
import { DI_TYPES } from '../../shared';
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
    // Services
    container.bind<IAuthService>(DI_TYPES.IAuthService).to(AuthService).inSingletonScope();
    container.bind<ISessionStore>(DI_TYPES.ISessionStore).to(SessionService).inSingletonScope();

    // Middleware
    container.bind<AuthMiddleware>(DI_TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();

    // Controllers
    container.bind<AuthController>(DI_TYPES.AuthController).to(AuthController).inSingletonScope();
  }

  static bindMerchant(container: Container): void {
    // Repositories
    container.bind<IMerchantRepository>(DI_TYPES.IMerchantRepository).to(MerchantRepository).inSingletonScope();
    container.bind<IGroupRepository>(DI_TYPES.IGroupRepository).to(GroupRepository).inSingletonScope();

    // Services
    container.bind<IMerchantService>(DI_TYPES.IMerchantService).to(MerchantService).inSingletonScope();
    container.bind<IGroupService>(DI_TYPES.IGroupService).to(GroupService).inSingletonScope();

    // Controllers
    container.bind<MerchantController>(DI_TYPES.MerchantController).to(MerchantController).inSingletonScope();
    container.bind<GroupController>(DI_TYPES.GroupController).to(GroupController).inSingletonScope();
  }

  /**
   * Bind all services to container
   */
  static bindAll(container: Container): void {
    this.bindInfrastructure(container);
    this.bindBootstrap(container);
    this.bindAuth(container);
    this.bindMerchant(container);
  }
}
