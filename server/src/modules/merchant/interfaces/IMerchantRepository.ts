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
   * Bussiness logic: get all active merchants from table `merchants` and filter out merchants that are already registered in the registry
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered merchants
   * Bussiness logic: get all merchants from `merchant_group_members` and filter out merchants that are not registered in the registry
   */
  getRegisteredMerchants(params?: CommonParams): Promise<MerchantWithRegistry[]>;

  /**
   * Add merchant to registry
   * Bussiness logic: add merchant to `merchant_group_members`
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest): Promise<number>;

  /**
   * Update merchant in registry
   * Bussiness logic: update merchant from `merchant_group_members`
   */
  updateMerchantInRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   * Bussiness logic: remove merchant from `merchant_group_members`
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;

  /**
   * Check if merchant is registered
   * Bussiness logic: check if merchant is registered in `merchant_group_members`
   */
  isMerchantRegistered(merchantId: number): Promise<boolean>;

  /**
   * Get reigistered merchants count
   * Bussiness logic: get count of registered merchants
   */
  getRegisteredMerchantsCount(params: CommonParams): Promise<number>;
}
