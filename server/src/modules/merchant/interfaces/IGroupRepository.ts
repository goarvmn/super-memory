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
   * Bussiness logic: get all active groups and count active members
   */
  getAllGroups(params?: CommonParams): Promise<GroupSummary[]>;

  /**
   * Get group detail with members
   * Bussiness logic: get group detail with active members
   */
  getGroupWithMembers(groupId: number): Promise<GroupWithMembers | null>;

  /**
   * Create new group with members
   * Bussiness logic: create new group with members using atomic transaction
   */
  createGroupWithMembersAtomic(
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
   * Bussiness logic: delete group, soft delete by setting status to 0
   */
  deleteGroup(groupId: number): Promise<void>;

  /**
   * Add member to group
   * Bussiness logic: add member to group
   */
  addMemberToGroup(groupId: number, merchantId: number, merchantCode: string, isSource?: boolean): Promise<void>;

  /**
   * Remove member from group
   * Bussiness logic: remove member from group
   */
  removeMemberFromGroup(groupId: number, merchantId: number): Promise<void>;

  /**
   * Set template source merchant
   * Bussiness logic: set template source merchant using transaction
   */
  setTemplateSource(groupId: number, merchantId: number): Promise<void>;

  /**
   * Get group members
   * Bussiness logic: get group members by group ID, filter out inactive merchants
   */
  getGroupMembers(groupId: number): Promise<GroupMember[]>;

  /**
   * Check if group exists
   * Bussiness logic: check if group exists
   */
  groupExists(groupId: number): Promise<boolean>;

  /**
   * Get all groups count
   * Bussiness logic: get all groups count, filter out inactive groups
   */
  getAllGroupsCount(params?: CommonParams): Promise<number>;

  /**
   * Check if merchant is already a member of specific group
   * Bussiness logic: check if merchant is already a member of specific group, filter out inactive merchants
   */
  isMemberOfGroup(groupId: number, merchantId: number): Promise<boolean>;
}
