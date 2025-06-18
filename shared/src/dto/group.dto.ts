// shared/src/dto/group.dto.ts

import { ApplyTemplateResult, GroupWithSync, SyncOperationResult } from '../types/merchant.types';

/**
 * Get Groups Request
 */
export interface GetGroupsRequest {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

/**
 * Get Groups Response
 */
export interface GetGroupsResponse {
  groups: GroupWithSync[];
  total_count: number;
  page: number;
  limit: number;
}

/**
 * Get Group Members Request
 */
export interface GetGroupMembersRequest {
  group_id: number;
  include_sync_info?: boolean;
}

/**
 * Get Group Members Response
 */
export interface GetGroupMembersResponse {
  group_id: number;
  group_name: string;
  members: Array<{
    id: string;
    name: string;
    merchant_code: string;
    status: 'active' | 'inactive';
    is_source: boolean;
    product_count: number;
    sync_info?: {
      total_products: number;
      synced_products: number;
      new_products: number;
      has_unsynced: boolean;
    };
  }>;
  total_members: number;
}

/**
 * Create Group Request
 */
export interface CreateGroupRequest {
  name: string;
  status: 'active' | 'inactive';
  member_ids: string[];
  source_merchant_id: string;
}

/**
 * Create Group Response
 */
export interface CreateGroupResponse {
  success: boolean;
  group_id: number;
  group_name: string;
  members_added: number;
  message: string;
}

/**
 * Update Group Request
 */
export interface UpdateGroupRequest {
  name?: string;
  status?: 'active' | 'inactive';
  source_merchant_id?: string;
}

/**
 * Update Group Response
 */
export interface UpdateGroupResponse {
  success: boolean;
  group_id: number;
  updated_fields: string[];
  message: string;
}

/**
 * Delete Group Request
 */
export interface DeleteGroupRequest {
  group_id: number;
  confirm: boolean; // Safety confirmation
}

/**
 * Delete Group Response
 */
export interface DeleteGroupResponse {
  success: boolean;
  group_id: number;
  members_retained: number;
  message: string;
}

/**
 * Sync (All) Group Request
 */
export interface SyncGroupRequest {
  group_id: number;
}

/**
 * Sync Group Response
 */
export interface SyncGroupResponse extends SyncOperationResult {
  // Inherits: success, group_id, total_processed, newly_created, already_synced, errors, message
  members_processed: number;
  members_with_new_products: number;
}

/**
 * Apply Template Request
 */
export interface ApplyTemplateRequest {
  group_id: number;
  source_merchant_id?: string;
  target_member_ids?: string[];
}

/**
 * Apply Template Response
 */
export interface ApplyTemplateResponse extends ApplyTemplateResult {
  // Inherits: success, group_id, source_id, members_processed, mappings_applied, matched_products, errors, message
}

/**
 * Add Group Member Request
 */
export interface AddGroupMemberRequest {
  group_id: number;
  merchant_id: string;
  is_source?: boolean;
}

/**
 * Add Group Member Response
 */
export interface AddGroupMemberResponse {
  success: boolean;
  group_id: number;
  merchant_id: string;
  is_source: boolean;
  message: string;
}

/**
 * Remove Group Member Request
 */
export interface RemoveGroupMemberRequest {
  group_id: number;
  merchant_id: string;
}

/**
 * Remove Group Member Response
 */
export interface RemoveGroupMemberResponse {
  success: boolean;
  group_id: number;
  merchant_id: string;
  remaining_members: number;
  message: string;
}
