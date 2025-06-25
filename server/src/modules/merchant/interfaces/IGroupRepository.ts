// server/src/modules/merchant/interfaces/IGroupRepository.ts

import {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  GroupSummary,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { CommonParams } from 'server/src/shared';

export interface GroupMemberRecord {
  merchant_id: number;
  merchant_code: string;
  merchant_name: string;
  merchant_status: number;
  registry_id: number;
  registry_status: number;
  group_id: number;
  is_merchant_source: boolean;
}

export interface IGroupRepository {
  /**
   * Get all groups
   * Business logic: retrieve all active groups with their active member counts, supports search and pagination
   */
  getAllGroups(params?: CommonParams): Promise<GroupSummary[]>;

  /**
   * Get group detail with members
   * Business logic: retrieve group information along with all its active members and their details
   */
  getGroupWithMembers(group_id: number): Promise<GroupWithMembers | null>;

  /**
   * Create new group with members
   * Business logic: atomically create a new group and add members to it, with optional merchant source designation.
   * Uses database transaction to ensure data consistency
   */
  createGroupWithMembersAtomic(
    group_data: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchant_source_id?: number
  ): Promise<CreateGroupResponse>;

  /**
   * Update group
   * Business logic: update group information including name, status, or merchant source
   */
  updateGroup(params: UpdateGroupRequest): Promise<void>;

  /**
   * Delete group
   * Business logic: delete group and deactivate all members, members become inactive individuals
   */
  deleteGroup(group_id: number): Promise<void>;

  /**
   * Assign member to group
   * Business logic: assign a registered merchant (currently individual) to an existing group by updating their group assignment with optional source designation
   */
  assignMemberToGroup(group_id: number, merchant_id: number, is_source?: boolean): Promise<void>;

  /**
   * Remove member from group
   * Business logic: soft delete a member from a group by setting their status to inactive, preserving membership history
   */
  removeMemberFromGroup(group_id: number, merchant_id: number): Promise<void>;

  /**
   * Set template source merchant
   * Business logic: atomically designate a specific merchant as the template source for a group,
   * ensuring only one source merchant exists per group using transaction
   */
  setTemplateSource(group_id: number, merchant_id: number): Promise<void>;

  /**
   * Get group members
   * Business logic: retrieve all active members of a group with their merchant details,
   * ordered by source status (source first) then by merchant name
   */
  getGroupMembers(group_id: number): Promise<GroupMemberRecord[]>;

  /**
   * Check if group exists
   * Business logic: verify if a group exists and is active in the system
   */
  groupExists(group_id: number): Promise<boolean>;

  /**
   * Get all groups count
   * Business logic: count total number of active groups, supports search filtering for pagination purposes
   */
  getAllGroupsCount(params?: CommonParams): Promise<number>;

  /**
   * Check if merchant is already a member of specific group
   * Business logic: verify if a merchant is already an active member of a specific group to prevent duplicate memberships
   */
  isMemberOfGroup(group_id: number, merchant_id: number): Promise<boolean>;
}
