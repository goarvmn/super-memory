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
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered merchants
   */
  getRegisteredMerchants(params?: CommonParams): Promise<GetMerchantsResponse>;

  /**
   * Add merchant to registry
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<AddMerchantToRegistryResponse>;

  /**
   * Update merchant registry
   */
  updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;
}
