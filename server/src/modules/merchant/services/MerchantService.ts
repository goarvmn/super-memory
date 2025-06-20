// server/src/modules/merchant/services/MerchantService.ts

import {
  AddMerchantToRegistryRequest,
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
   * Add merchant to registry
   */
  async addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number> {
    try {
      // Validate merchant
      const isAlreadyRegistered = await this.merchantRepository.isMerchantRegistered(params.merchant_id);
      if (isAlreadyRegistered) {
        throw new Error(`Merchant ${params.merchant_id} is already registered`);
      }

      // Validate required fields
      if (!params.merchant_id || !params.merchant_code) {
        throw new Error('Merchant ID and merchant code are required');
      }

      // Add to registry
      const registryId = await this.merchantRepository.addMerchantToRegistry(params);

      return registryId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchant to registry';
      throw new Error(`Add merchant to registry failed: ${errorMessage}`);
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

      // Business logic: If moving to group, unset is_merchant_source
      if (params.group_id && params.is_merchant_source === true) {
        throw new Error('Merchant cannot be source when assigned to group');
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
