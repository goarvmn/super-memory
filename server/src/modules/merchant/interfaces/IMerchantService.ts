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
   * Business logic: retrieve all active merchants that are available for registration (not yet registered in the registry)
   */
  getAvailableMerchants(params?: CommonParams): Promise<Merchant[]>;

  /**
   * Get registered merchants
   * Business logic: retrieve all merchants that are already registered in the registry with pagination support and total count
   */
  getRegisteredMerchants(params?: CommonParams): Promise<GetMerchantsResponse>;

  /**
   * Add merchants to registry
   * Business logic: batch register multiple merchants to the registry with validation and duplicate checking.
   * Returns success/failure count and details for each merchant processing attempt
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<AddMerchantToRegistryResponse>;

  /**
   * Update merchant registry
   * Business logic: update merchant registration data in the registry with validation of required registry ID
   */
  updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   * Business logic: unregister a merchant from the registry by removing its registration record with validation
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;
}
