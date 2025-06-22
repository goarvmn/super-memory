// server/src/modules/merchant/interfaces/IMerchantService.ts

import {
  AddMerchantToRegistryRequest,
  BulkAddResult,
  Merchant,
  MerchantWithRegistry,
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
   * Get list of (registered) merchants
   */
  getRegisteredIndividualMerchants(params?: CommonParams): Promise<MerchantWithRegistry[]>;

  /**
   * Add merchant to registry
   */
  addMerchantToRegistry(params: AddMerchantToRegistryRequest[]): Promise<BulkAddResult>;

  /**
   * Update merchant registry
   */
  updateMerchantRegistry(params: UpdateMerchantRegistryRequest): Promise<void>;

  /**
   * Remove merchant from registry
   */
  removeMerchantFromRegistry(registryId: number): Promise<void>;
}
