// server/src/modules/merchant/interfaces/IMerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  Merchant,
  MerchantWithRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

export interface IMerchantRepository {
  /**
   * Get available merchants
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered individual merchants
   */
  getRegisteredIndividualMerchants(params?: CommonParams): Promise<MerchantWithRegistry[]>;

  /**
   * Add merchant to registry
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number>;

  /**
   * Update merchant in registry
   */
  updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;

  /**
   * Check if merchant is registered
   */
  isMerchantRegistered(merchantId: number): Promise<boolean>;

  /**
   * Get reigistered merchants count
   */
  getRegisteredMerchantsCount(params: CommonParams): Promise<number>;
}
