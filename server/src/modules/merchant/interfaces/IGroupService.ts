// server/src/modules/merchant/interfaces/IGroupService.ts

import {
  AddMerchantToRegistryRequest,
  BulkAddMerchantsResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupsResponse,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

/**
 * Group Service Interface
 */

export interface IGroupService {
  /**
   * Get all groups
   * Business logic: retrieve all active groups with member counts, pagination support, and total count calculation
   */
  getAllGroups(params?: CommonParams): Promise<GetGroupsResponse>;

  /**
   * Get group detail with members
   * Business logic: retrieve group information along with all active members, includes validation to ensure group exists
   */
  getGroupWithMembers(group_id: number): Promise<GroupWithMembers>;

  /**
   * Create new group with members
   * Business logic: atomically create a new group with initial members (not yet registered in registry), validates group name, member data,
   * checks for duplicate registrations, and optionally designates a source merchant
   */
  createGroupWithMembers(
    group_data: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchant_source_id?: number
  ): Promise<CreateGroupResponse>;

  /**
   * Update group
   * Business logic: update group information with validation to ensure group exists and name meets minimum requirements
   */
  updateGroup(params: UpdateGroupRequest): Promise<void>;

  /**
   * Delete group
   * Business logic: soft delete a group by setting status to inactive, preserves data for audit purposes with validation
   */
  deleteGroup(group_id: number): Promise<void>;

  /**
   * Add merchant(s) to group
   * Business logic: bulk add multiple merchants to an existing group, automatically registers unregistered merchants,
   * validates duplicate memberships, and provides detailed success/failure reporting
   */
  addMerchantsToGroup(group_id: number, merchants: AddMerchantToRegistryRequest[]): Promise<BulkAddMerchantsResponse>;

  /**
   * Remove member from group
   * Business logic: soft delete a member from group, member automatically becomes individual merchant,
   * validates group and member existence before removal
   */
  removeMemberFromGroup(group_id: number, merchant_id: number): Promise<void>;

  /**
   * Set template source merchant
   * Business logic: atomically designate a merchant as the template source for a group,
   * validates that merchant is an active member of the group before setting as source
   */
  setTemplateSource(group_id: number, merchant_id: number): Promise<void>;
}
