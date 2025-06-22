// server/src/modules/merchant/interfaces/IGroupRepository.ts

import {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  GroupMember,
  GroupSummary,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

export interface IGroupRepository {
  /**
   * Get all groups
   */
  getAllGroups(params?: CommonParams): Promise<GroupSummary[]>;

  /**
   * Get group detail
   */
  getGroupWithMembers(groupId: number): Promise<GroupWithMembers | null>;

  /**
   * create group with members (atomic transaction)
   */
  createGroupWithMembersAtomic(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse>;

  /**
   * Update group
   */
  updateGroup(params: UpdateGroupRequest): Promise<void>;

  /**
   * Delete group
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
   * Get group members only
   */
  getGroupMembers(groupId: number): Promise<GroupMember[]>;

  /**
   * Check if group exists
   */
  groupExists(groupId: number): Promise<boolean>;

  /**
   * Get all groups count
   */
  getAllGroupsCount(params?: CommonParams): Promise<number>;
}
