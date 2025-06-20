// server/src/modules/merchant/interfaces/IGroupService.ts

import {
  CreateGroupRequest,
  GroupMember,
  GroupSummary,
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
  getAllGroups(params?: CommonParams): Promise<GroupSummary[]>;

  /**
   * Get group detail with members
   */
  getGroupWithMembers(groupId: number): Promise<GroupWithMembers>;

  /**
   * Create new group
   */
  createGroup(params: CreateGroupRequest): Promise<number>;

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
   * Get group members only (helper method)
   */
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
}
