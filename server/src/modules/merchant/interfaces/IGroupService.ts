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
   * Bussiness logic: get all groups with pagination
   */
  getAllGroups(params?: CommonParams): Promise<GetGroupsResponse>;

  /**
   * Get group detail with members
   * Bussiness logic: get group detail with active members
   */
  getGroupWithMembers(groupId: number): Promise<GroupWithMembers>;

  /**
   * Create new group with members
   * Bussiness logic: create new group with members
   */
  createGroupWithMembers(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse>;

  /**
   * Update group
   * Bussiness logic: update group information
   */
  updateGroup(params: UpdateGroupRequest): Promise<void>;

  /**
   * Delete group
   * Bussiness logic: remove group from list
   */
  deleteGroup(groupId: number): Promise<void>;

  /**
   * Add merchant(s) to group
   * Bussiness logic: add merchant(s) to group with bulk operation
   */
  addMerchantsToGroup(groupId: number, merchants: AddMerchantToRegistryRequest[]): Promise<BulkAddMerchantsResponse>;

  /**
   * Remove member from group
   * Bussiness logic: remove member from group
   */
  removeMemberFromGroup(groupId: number, merchantId: number): Promise<void>;

  /**
   * Set template source merchant
   */
  setTemplateSource(groupId: number, merchantId: number): Promise<void>;
}
