// server/src/modules/merchant/controllers/MerchantController.ts

import {
  AddMerchantToRegistryResponse,
  BaseApiResponse,
  GetMerchantsResponse,
  Merchant,
  MerchantErrorCode,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../shared';
import { paginationToOffset } from '../../../shared/utils';
import { AuthenticatedRequest } from '../../auth/middleware/AuthMiddleware';
import { IMerchantService } from '../interfaces';

/**
 * Merchant Controller
 * Handles merchant REST endpoints
 */
@injectable()
export class MerchantController {
  constructor(@inject(DI_TYPES.IMerchantService) private merchantService: IMerchantService) {}

  /**
   * GET /api/merchants/available
   * Get available merchants (not registered in registry)
   */
  getAvailableMerchants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 5, search, status } = req.query;

      // Convert pagination
      const { offset } = paginationToOffset(Number(page), Number(limit));

      const merchants = await this.merchantService.getAvailableMerchants({
        search: search as string,
        status: status ? Number(status) : undefined,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        data: merchants,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<Merchant[]>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available merchants';

      res.status(500).json({
        success: false,
        error: {
          code: MerchantErrorCode.GET_AVAILABLE_MERCHANTS_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * GET /api/merchants
   * Get registered merchants with pagination
   */
  getRegisteredMerchants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 9, search, status } = req.query;

      // Convert pagination
      const { offset } = paginationToOffset(Number(page), Number(limit));

      const response = await this.merchantService.getRegisteredMerchants({
        search: search as string,
        status: status ? Number(status) : undefined,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<GetMerchantsResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get registered merchants';

      res.status(500).json({
        success: false,
        error: {
          code: MerchantErrorCode.GET_REGISTERED_MERCHANTS_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * POST /api/merchants/registry
   * Add merchants to registry (bulk operation)
   */
  addMerchantsToRegistry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const merchants = req.body;

      if (!Array.isArray(merchants)) {
        res.status(400).json({
          success: false,
          error: {
            code: MerchantErrorCode.VALIDATION_ERROR,
            message: 'Expected array of merchants',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      const result = await this.merchantService.addMerchantToRegistry(merchants);

      const statusCode = result.failed.length > 0 ? 207 : 201; // 207 Multi-Status if partial success

      res.status(statusCode).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<AddMerchantToRegistryResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to registry';

      res.status(500).json({
        success: false,
        error: {
          code: MerchantErrorCode.ADD_MERCHANTS_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * PUT /api/merchants/registry/:registryId
   * Update merchant in registry
   */
  updateMerchantRegistry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const registryId = Number(req.params.registryId);
      const updateData = req.body as Omit<UpdateMerchantRegistryRequest, 'registryId'>;

      await this.merchantService.updateMerchantRegistry({ ...updateData, registryId });

      res.status(200).json({
        success: true,
        data: { message: 'Merchant registry updated successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update merchant registry';

      res.status(500).json({
        success: false,
        error: {
          code: MerchantErrorCode.UPDATE_MERCHANT_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * DELETE /api/merchants/registry/:registryId
   * Remove merchant from registry
   */
  removeMerchantFromRegistry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const registryId = Number(req.params.registryId);

      await this.merchantService.removeMerchantFromRegistry(registryId);

      res.status(200).json({
        success: true,
        data: { message: 'Merchant removed from registry successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove merchant from registry';

      res.status(500).json({
        success: false,
        error: {
          code: MerchantErrorCode.REMOVE_MERCHANT_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };
}
