// shared/src/types/merchant.types.ts

/**
 * Core Merchant Interface
 * Based on existing merchants table
 */
export interface Merchant {
  id: string;
  name: string;
  merchant_code: string;
  status: 'active' | 'inactive';
}

/**
 * Merchant Group Interface
 * Based on merchant_groups table
 */
export interface MerchantGroup {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  template_source_merchant_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Group Member Interface
 * Based on merchant_group_members table
 */
export interface MerchantGroupMember {
  group_id: number;
  merchant_id: string;
  is_template_source: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Extended Group with Members (for UI display)
 * Combines MerchantGroup with member details
 */
export interface GroupWithMembers extends MerchantGroup {
  members: Array<{
    id: string;
    name: string;
    merchant_code: string;
    status: 'active' | 'inactive';
    is_source: boolean; // Maps to is_template_source in DB
    product_count: number; // For display consistency
    sync_info?: SyncInfo;
  }>;
  source_merchant?: {
    id: string;
    name: string;
    merchant_code: string;
  };
}

/**
 * Sync Information Interface
 * Smart detection data for merchant products
 */
export interface SyncInfo {
  total_products: number;
  synced_products: number;
  new_products: number;
  last_sync_at?: string;
  has_unsynced: boolean;
}

/**
 * Merchant with Sync Info (for dashboard display)
 * Combines merchant data with sync status
 */
export interface MerchantWithSync extends Merchant {
  sync_info: SyncInfo;
}

/**
 * Group Sync Summary
 * Aggregated sync info for entire group
 */
export interface GroupSyncInfo {
  total_products: number;
  synced_products: number;
  new_products: number;
  members_with_unsynced: number;
  total_members: number;
}

/**
 * Extended Group with Sync Info (for dashboard display)
 */
export interface GroupWithSync extends GroupWithMembers {
  group_sync_info: GroupSyncInfo;
}

/**
 * Sync Operation Result
 * Response from sync operations
 */
export interface SyncOperationResult {
  success: boolean;
  merchant_id?: string;
  group_id?: number;
  total_processed: number;
  newly_created: number;
  already_synced: number;
  errors: Array<{
    product_id: string;
    error: string;
  }>;
  message: string;
}

/**
 * Apply Template Operation Result
 * Response from apply-to-all-members operations
 */
export interface ApplyTemplateResult {
  success: boolean;
  group_id: number;
  source_id: string;
  members_processed: number;
  mappings_applied: number;
  matched_products: number;
  errors: Array<{
    member_id: string;
    product_name: string;
    error: string;
  }>;
  message: string;
}
