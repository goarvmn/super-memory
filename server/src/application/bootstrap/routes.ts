// server/src/application/bootstrap/routes.ts

import { AUTH_ENDPOINTS, BaseApiResponse, GROUP_ENDPOINTS, MERCHANT_ENDPOINTS } from '@guesense-dash/shared';
import express from 'express';
import { getEnvironmentConfig } from '../../infrastructure/config/environment';
import type { AuthController, AuthMiddleware } from '../../modules/auth';
import type { GroupController, MerchantController } from '../../modules/merchant';
import { DI_TYPES } from '../../shared';
import { container } from '../container';

/**
 * Route Bootstrap Handler
 */
export class RouteBootstrap {
  private env: ReturnType<typeof getEnvironmentConfig>;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;
  private merchantController: MerchantController;
  private groupController: GroupController;

  constructor() {
    this.env = getEnvironmentConfig();
    this.authController = container.get<AuthController>(DI_TYPES.AuthController);
    this.authMiddleware = container.get<AuthMiddleware>(DI_TYPES.AuthMiddleware);
    this.merchantController = container.get<MerchantController>(DI_TYPES.MerchantController);
    this.groupController = container.get<GroupController>(DI_TYPES.GroupController);
  }

  private setupHealthRoutes(app: express.Application): void {
    app.get('/health', (_req, res) => {
      res.json({
        success: true,
        message: 'GueSense Dashboard API is running',
        timestamp: new Date().toISOString(),
        environment: this.env.NODE_ENV,
        version: '1.0.0',
      });
    });
  }

  private setupApiRoutes(app: express.Application): void {
    const apiRouter = express.Router();

    // Auth routes
    apiRouter.post(AUTH_ENDPOINTS.LOGIN, this.authController.login);
    apiRouter.post(AUTH_ENDPOINTS.LOGOUT, this.authMiddleware.authenticate, this.authController.logout);
    apiRouter.get(AUTH_ENDPOINTS.VALIDATE, this.authMiddleware.authenticate, this.authController.validate);
    apiRouter.get(AUTH_ENDPOINTS.ME, this.authMiddleware.authenticate, this.authController.me);

    // Merchant routes
    apiRouter.get(
      MERCHANT_ENDPOINTS.GET_AVAILABLE_MERCHANTS,
      this.authMiddleware.authenticate,
      this.merchantController.getAvailableMerchants
    );
    apiRouter.get(
      MERCHANT_ENDPOINTS.GET_REGISTERED_MERCHANTS,
      this.authMiddleware.authenticate,
      this.merchantController.getRegisteredMerchants
    );
    apiRouter.post(
      MERCHANT_ENDPOINTS.ADD_MERCHANTS_TO_REGISTRY,
      this.authMiddleware.authenticate,
      this.merchantController.addMerchantsToRegistry
    );
    apiRouter.put(
      MERCHANT_ENDPOINTS.UPDATE_MERCHANT_REGISTRY,
      this.authMiddleware.authenticate,
      this.merchantController.updateMerchantRegistry
    );
    apiRouter.delete(
      MERCHANT_ENDPOINTS.REMOVE_MERCHANT_FROM_REGISTRY,
      this.authMiddleware.authenticate,
      this.merchantController.removeMerchantFromRegistry
    );

    // Group routes
    apiRouter.get(GROUP_ENDPOINTS.GET_ALL_GROUPS, this.authMiddleware.authenticate, this.groupController.getAllGroups);
    apiRouter.get(
      GROUP_ENDPOINTS.GET_GROUP_WITH_MEMBERS,
      this.authMiddleware.authenticate,
      this.groupController.getGroupWithMembers
    );
    apiRouter.post(
      GROUP_ENDPOINTS.CREATE_GROUP_WITH_MEMBERS,
      this.authMiddleware.authenticate,
      this.groupController.createGroupWithMembers
    );
    apiRouter.put(GROUP_ENDPOINTS.UPDATE_GROUP, this.authMiddleware.authenticate, this.groupController.updateGroup);
    apiRouter.delete(GROUP_ENDPOINTS.DELETE_GROUP, this.authMiddleware.authenticate, this.groupController.deleteGroup);
    apiRouter.post(
      GROUP_ENDPOINTS.ADD_MERCHANTS_TO_GROUP,
      this.authMiddleware.authenticate,
      this.groupController.addMerchantsToGroup
    );
    apiRouter.delete(
      GROUP_ENDPOINTS.REMOVE_MEMBER_FROM_GROUP,
      this.authMiddleware.authenticate,
      this.groupController.removeMemberFromGroup
    );
    apiRouter.put(
      GROUP_ENDPOINTS.SET_TEMPLATE_SOURCE,
      this.authMiddleware.authenticate,
      this.groupController.setTemplateSource
    );

    app.use('/api', apiRouter);
  }

  private setup404Handler(app: express.Application): void {
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    });
  }

  setup(app: express.Application): void {
    this.setupHealthRoutes(app);
    this.setupApiRoutes(app);
    this.setup404Handler(app);
  }
}
