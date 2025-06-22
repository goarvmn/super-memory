// server/src/modules/merchant/interfaces/IGroupService.ts

import {
  AddMerchantToRegistryRequest,
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
   */
  getAllGroups(params?: CommonParams): Promise<GetGroupsResponse>;

  /**
   * Get group detail with members
   */
  getGroupWithMembers(groupId: number): Promise<GroupWithMembers>;

  /**
   * Update group
   */
  updateGroup(params: UpdateGroupRequest): Promise<void>;

  /**
   * Delete group (soft delete)
   */
  deleteGroup(groupId: number): Promise<void>;

  /**
   * Add member to group
   */
  addMemberToGroup(groupId: number, merchantId: number, merchantCode: string, isSource?: boolean): Promise<void>;

  /**
   * Remove member from group
   */
  removeMemberFromGroup(groupId: number, merchantId: number): Promise<void>;

  /**
   * Set template source merchant
   */
  setTemplateSource(groupId: number, merchantId: number): Promise<void>;

  /**
   * Create new group with members (atomic operation)
   */
  createGroupWithMembers(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse>;
}
