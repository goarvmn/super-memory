// server/src/modules/merchant/interfaces/IMerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  GetMerchantsRequest,
  Merchant,
  MerchantWithRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';

export interface IMerchantRepository {
  /**
   * Get available merchants
   */
  getAvailableMerchants(params?: GetMerchantsRequest): Promise<Merchant[]>;

  /**
   * Get registered individual merchants
   */
  getRegisteredIndividualMerchants(params?: GetMerchantsRequest): Promise<MerchantWithRegistry[]>;

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
}
