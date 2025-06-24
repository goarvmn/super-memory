// server/src/modules/merchant/interfaces/IMerchantRepository.ts

import {
  AddMerchantToRegistryRequest,
  Merchant,
  MerchantRegistry,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

export interface IMerchantRepository {
  /**
   * Get available merchants
   * Business logic: get all active merchants from table `merchants` that are not yet registered in the registry
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered merchants
   * Business logic: get all merchants that are already registered in the registry as individual merchants (not part of any group)
   */
  getRegisteredMerchants(params?: CommonParams): Promise<MerchantRegistry[]>;

  /**
   * Add merchant to registry
   * Business logic: register a merchant as an individual merchant in the registry by adding to `merchant_group_members`
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number>;

  /**
   * Update merchant in registry
   * Business logic: update merchant registration data in `merchant_group_members`
   */
  updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   * Business logic: unregister a merchant by removing its record from `merchant_group_members`
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;

  /**
   * Check if merchant is registered
   * Business logic: verify if a merchant is already registered in the registry by checking `merchant_group_members`
   */
  isMerchantRegistered(merchantId: number): Promise<boolean>;

  /**
   * Get registered merchants count
   * Business logic: count total number of active registered individual merchants in the registry
   */
  getRegisteredMerchantsCount(params: CommonParams): Promise<number>;
}
