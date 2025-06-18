// shared/src/dto/merchant.dto.ts

import { MerchantWithSync, SyncOperationResult } from '../types/merchant.types';

/**
 * Get Merchants Request
 */
export interface GetMerchantsRequest {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

/**
 * Get Merchants Response
 */
export interface GetMerchantsResponse {
  merchants: MerchantWithSync[];
  total_count: number;
  page: number;
  limit: number;
}

/**
 * Sync Merchant Request
 */
export interface SyncMerchantRequest {
  merchant_id: string;
}

/**
 * Sync Merchant Response
 */
export interface SyncMerchantResponse extends SyncOperationResult {
  // Inherits all fields from SyncOperationResult
}

/**
 * Update Merchant Request
 */
export interface UpdateMerchantRequest {
  status?: 'active' | 'inactive';
  // Future fields can be added here
}

/**
 * Update Merchant Response
 */
export interface UpdateMerchantResponse {
  success: boolean;
  merchant_id: string;
  updated_fields: string[];
  message: string;
}
