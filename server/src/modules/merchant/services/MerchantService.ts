// server/src/modules/merchant/services/MerchantService.ts

import {
  AddMerchantToRegistryRequest,
  BulkAddResult,
  Merchant,
  MerchantWithRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IMerchantRepository, IMerchantService } from '../interfaces';

/**
 * Merchant Service Implementation
 */
@injectable()
export class MerchantService implements IMerchantService {
  constructor(
    @inject(DI_TYPES.IMerchantRepository)
    private merchantRepository: IMerchantRepository
  ) {}

  /**
   * Get available merchants
   */
  async getAvailableMerchants(params?: CommonParams): Promise<Merchant[]> {
    try {
      const defaultParams: CommonParams = {
        limit: params?.limit || 5,
        offset: params?.offset || 0,
        ...params,
      };

      return await this.merchantRepository.getAvailableMerchants(defaultParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available merchants';
      throw new Error(`Get available merchants failed: ${errorMessage}`);
    }
  }

  /**
   * Get list of (registered) merchants
   */
  async getRegisteredIndividualMerchants(params?: CommonParams): Promise<MerchantWithRegistry[]> {
    try {
      const defaultParams: CommonParams = {
        limit: params?.limit || 9,
        offset: params?.offset || 0,
        ...params,
      };

      return await this.merchantRepository.getRegisteredIndividualMerchants(defaultParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get registered merchants';
      throw new Error(`Get registered merchants failed: ${errorMessage}`);
    }
  }

  /**
   * Add merchants to registry
   */
  async addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<BulkAddResult> {
    try {
      // validate input
      if (!Array.isArray(params) || params.length === 0) {
        throw new Error('At least one merchant is required');
      }

      const result: BulkAddResult = {
        successCount: 0,
        totalCount: params.length,
        failed: [],
      };

      for (const merchant of params) {
        try {
          // validate required fields
          if (!merchant.merchant_id || !merchant.merchant_code) {
            result.failed.push({
              merchant_id: merchant.merchant_id || 0,
              error: 'Merchant ID and merchant code are required',
            });
            continue;
          }

          const isAlreadyRegistered = await this.merchantRepository.isMerchantRegistered(merchant.merchant_id);
          if (isAlreadyRegistered) {
            result.failed.push({
              merchant_id: merchant.merchant_id,
              error: `Merchant ${merchant.merchant_id} is already registered`,
            });
            continue;
          }

          await this.merchantRepository.addMerchantToRegistry(merchant);
          result.successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to process merchant';
          result.failed.push({
            merchant_id: merchant.merchant_id,
            error: errorMessage,
          });
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to registry';
      throw new Error(`Add merchants to registry failed: ${errorMessage}`);
    }
  }

  /**
   * Update merchant registry
   */
  async updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    try {
      // Validate required fields
      if (!params.registry_id) {
        throw new Error('Registry ID is required');
      }

      await this.merchantRepository.updateMerchantInRegistry(params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update merchant registry';
      throw new Error(`Update merchant registry failed: ${errorMessage}`);
    }
  }

  /**
   * Remove merchant from registry
   */
  async removeMerchantFromRegistry(registryId: number): Promise<void> {
    try {
      // Validate registry ID
      if (!registryId || registryId <= 0) {
        throw new Error('Valid registry ID is required');
      }

      await this.merchantRepository.removeMerchantFromRegistry(registryId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove merchant from registry';
      throw new Error(`Remove merchant from registry failed: ${errorMessage}`);
    }
  }
}
