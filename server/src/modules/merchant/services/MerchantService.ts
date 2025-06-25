// server/src/modules/merchant/services/MerchantService.ts

import {
  AddMerchantToRegistryRequest,
  AddMerchantToRegistryResponse,
  GetMerchantsResponse,
  Merchant,
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
   * Business logic: retrieve all active merchants that are available for registration (not yet registered in the registry)
   */
  async getAvailableMerchants(params?: CommonParams): Promise<Merchant[]> {
    try {
      const defaultParams: CommonParams = {
        limit: params?.limit ?? 5,
        offset: params?.offset ?? 0,
        ...params,
      };

      return await this.merchantRepository.getAvailableMerchants(defaultParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get available merchants';
      throw new Error(`Get available merchants failed: ${errorMessage}`);
    }
  }

  /**
   * Get registered merchants
   * Business logic: retrieve all merchants that are already registered in the registry with pagination support and total count
   */
  async getRegisteredMerchants(params?: CommonParams): Promise<GetMerchantsResponse> {
    try {
      const limit = params?.limit ?? 6;
      const offset = params?.offset ?? 0;

      const defaultParams: CommonParams = {
        limit: limit,
        offset: offset,
        ...params,
      };

      const merchants = await this.merchantRepository.getRegisteredMerchants(defaultParams);

      const total = await this.merchantRepository.getRegisteredMerchantsCount(defaultParams);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = currentPage < totalPages;

      return {
        merchants,
        pagination: {
          total,
          totalPages,
          currentPage,
          hasNextPage,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get registered merchants';
      throw new Error(`Get registered merchants failed: ${errorMessage}`);
    }
  }

  /**
   * Add merchants to registry
   * Business logic: batch register multiple merchants to the registry with validation.
   * Returns success/failure count and details for each merchant processing attempt
   */
  async addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<AddMerchantToRegistryResponse> {
    try {
      // validate input
      if (!Array.isArray(params) || params.length === 0) {
        throw new Error('At least one merchant is required');
      }

      const result = {
        successCount: 0,
        totalCount: params.length,
        failed: [],
      } as AddMerchantToRegistryResponse;

      // process all merchants in parallel
      const promiseResults = await Promise.allSettled(
        params.map((merchant, index) => this.processMerchant(merchant, index))
      );

      // collect promiseResults
      promiseResults.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          result.successCount++;
        } else {
          result.failed.push({
            code: params[index].code || 'unknown',
            error: promiseResult.reason.message,
          });
        }
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to registry';
      throw new Error(`Add merchants to registry failed: ${errorMessage}`);
    }
  }

  /**
   * Update merchant registry
   * Business logic: update merchant registration data in the registry with validation of required registry ID
   */
  async updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void> {
    try {
      // validate required fields
      if (!params.registryId) {
        throw new Error('Registry ID is required');
      }

      // check if merchant is already registered
      const registeredMerchant = await this.merchantRepository.findRegisteredMerchant({ id: params.registryId });
      if (!registeredMerchant) {
        throw new Error(`Merchant is not registered`);
      }

      await this.merchantRepository.updateMerchantInRegistry(params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update merchant registry';
      throw new Error(`Update merchant registry failed: ${errorMessage}`);
    }
  }

  /**
   * Remove merchant from registry
   * Business logic: unregister a merchant from the registry by removing its registration record with validation
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

  /**
   * Process single merchant registration
   * Private method to handle individual merchant processing with validation
   */
  private async processMerchant(merchant: AddMerchantToRegistryRequest, _index: number): Promise<void> {
    // validate required fields
    if (!merchant.id || !merchant.code) {
      throw new Error('ID and code are required');
    }

    // check if merchant is already registered
    const registeredMerchant = await this.merchantRepository.findRegisteredMerchant({
      merchant_id: merchant.id,
    });

    if (registeredMerchant) {
      throw new Error(`Merchant "${merchant.code}" is already registered`);
    }

    await this.merchantRepository.addMerchantToRegistry(merchant);
  }
}
