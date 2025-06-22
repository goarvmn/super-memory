// server/src/modules/merchant/interfaces/IMerchantService.ts

import {
  AddMerchantToRegistryRequest,
  AddMerchantToRegistryResponse,
  GetMerchantsResponse,
  Merchant,
  UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

/**
 * Merchant Service Interface
 */
export interface IMerchantService {
  /**
   * Get available merchants
   * Bussiness logic: get all merchants that are not registered in the registry
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered merchants
   * Bussiness logic: get all merchants that are registered in the registry
   */
  getRegisteredMerchants(params?: CommonParams): Promise<GetMerchantsResponse>;

  /**
   * Add merchant to registry
   * Bussiness logic: add merchant(s) to registry
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<AddMerchantToRegistryResponse>;

  /**
   * Update merchant registry
   * Bussiness logic: update merchant in registry
   */
  updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   * Bussiness logic: remove merchant from registry
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;
}
