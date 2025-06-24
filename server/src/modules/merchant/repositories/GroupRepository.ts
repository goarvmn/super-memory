// server/src/modules/merchant/repositories/GroupRepository.ts

import {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  GroupSummary,
  GroupWithMembers,
  MerchantRegistry,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { CommonParams, DI_TYPES } from '../../../shared';
import { GroupMemberRecord, IGroupRepository } from '../interfaces';

/**
 * Database record interfaces for typing
 */
interface GroupRecord {
  id: number;
  name: string;
  status: number;
  merchant_source_id: number | null;
  created_at: Date;
  updated_at: Date;
}

interface MemberRecord {
  id: number;
  group_id: number;
  merchant_id: number;
  merchant_code: string;
  is_merchant_source: boolean;
  status: number;
  created_at: Date;
  updated_at: Date;
}

interface GroupSummaryRecord {
  id: number;
  name: string;
  status: number;
  merchant_source_id: number | null;
  members_count: number;
}

@injectable()
export class GroupRepository implements IGroupRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  /**
   * Get all groups
   * Business logic: retrieve all active groups with their active member counts, supports search and pagination
   */
  async getAllGroups(params: CommonParams = {}): Promise<GroupSummary[]> {
    const { search, status, limit = 9, offset = 0 } = params;

    let query = `
      SELECT 
        g.id, g.name, g.status, g.merchant_source_id,
        COUNT(mgm.id) as members_count
      FROM merchant_groups g
      LEFT JOIN merchant_group_members mgm ON g.id = mgm.group_id AND mgm.status = 1
      WHERE g.status = 1
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND g.name LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND g.status = ?`;
      queryParams.push(status);
    }

    query += ` GROUP BY g.id, g.name, g.status, g.merchant_source_id`;
    query += ` ORDER BY g.id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const results = await this.database.query<GroupSummaryRecord[]>(query, queryParams);

    // transform to GroupSummary
    return results.map<GroupSummary>(group => ({
      id: group.id,
      name: group.name,
      status: group.status,
      merchantSourceId: group.merchant_source_id,
      membersCount: group.members_count,
    }));
  }

  /**
   * Get group detail with members
   * Business logic: retrieve group information along with all its active members and their details
   */
  async getGroupWithMembers(group_id: number): Promise<GroupWithMembers | null> {
    const group = await this.database.findOne<any>('merchant_groups', {
      id: group_id,
      status: 1,
    });

    if (!group) {
      return null;
    }

    // get members with details
    const members = await this.getGroupMembers(group_id);

    // transform to MerchantRegistry
    const registeredMembers = members.map<MerchantRegistry>(member => ({
      id: member.merchant_id,
      name: member.merchant_name,
      code: member.merchant_code,
      status: member.merchant_status,
      registryId: member.registry_id,
      registryStatus: member.registry_status,
      groupId: member.group_id,
      isMerchantSource: member.is_merchant_source,
    }));

    return {
      ...group,
      member_count: members.length,
      members: registeredMembers,
    } as GroupWithMembers;
  }

  /**
   * Create new group with members
   * Business logic: atomically create a new group and add members to it, with optional merchant source designation.
   * Uses database transaction to ensure data consistency
   */
  async createGroupWithMembersAtomic(
    group_data: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchant_source_id?: number
  ): Promise<CreateGroupResponse> {
    // start database transaction
    const transaction = await this.database.startTransaction();

    try {
      const result: CreateGroupResponse = {
        groupId: 0,
        groupName: group_data.name,
        membersSuccessCount: 0,
        membersTotalCount: members.length,
        membersFailed: [],
        sourceSet: false,
        sourceMerchantId: merchant_source_id,
      };

      // create group within transaction
      const groupRecord = await transaction.create<GroupRecord>('merchant_groups', {
        name: group_data.name,
        status: group_data.status || 1,
        merchant_source_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      result.groupId = groupRecord.id;

      // add members within same transaction
      for (const member of members) {
        try {
          // determine source merchant - fixed property access
          const isSource = merchant_source_id === member.id;

          await transaction.create<MemberRecord>('merchant_group_members', {
            group_id: result.groupId,
            merchant_id: member.id,
            merchant_code: member.code,
            is_merchant_source: isSource,
            status: 1, // set to active by default
            created_at: new Date(),
            updated_at: new Date(),
          });

          result.membersSuccessCount++;

          if (isSource) {
            result.sourceSet = true;
          }
        } catch (memberError) {
          const errorMessage = memberError instanceof Error ? memberError.message : 'Failed to add member';
          result.membersFailed.push({
            code: member.code,
            error: errorMessage,
          });

          if (merchant_source_id === member.id) {
            result.sourceSet = false;
          }
        }
      }

      if (result.sourceSet && merchant_source_id) {
        await transaction.update(
          'merchant_groups',
          { id: result.groupId },
          {
            merchant_source_id: merchant_source_id,
            updated_at: new Date(),
          }
        );
      }

      if (result.membersSuccessCount === 0) {
        // business rule: group without any members should fail
        throw new Error('No members were successfully added to the group');
      }

      // commit transaction
      await transaction.commit();

      return result;
    } catch (error) {
      // rollback transaction
      await transaction.rollback();

      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      throw new Error(`Create group with members atomic operation failed: ${errorMessage}`);
    }
  }

  /**
   * Update group
   * Business logic: update group information including name, status, or merchant source
   */
  async updateGroup(params: UpdateGroupRequest): Promise<void> {
    const { id, ...updateData } = params;

    await this.database.update('merchant_groups', { id }, updateData);
  }

  /**
   * Delete group
   * Business logic: delete group and deactivate all members, members become inactive individuals
   */
  async deleteGroup(group_id: number): Promise<void> {
    const transaction = await this.database.startTransaction();

    try {
      // deactivate all members
      await transaction.update('merchant_group_members', { group_id: group_id }, { status: false });

      // delete group
      await transaction.delete('merchant_groups', { id: group_id });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Assign member to group
   * Business logic: assign a registered merchant (currently individual) to an existing group by updating their group assignment with optional source designation
   */
  async assignMemberToGroup(group_id: number, merchant_id: number, is_merchant_source: boolean = false): Promise<void> {
    await this.database.update(
      'merchant_group_members',
      {
        merchant_id: merchant_id,
      },
      {
        group_id: group_id,
        is_merchant_source: is_merchant_source,
      }
    );
  }

  /**
   * Remove member from group
   * Business logic: soft delete a member from a group by setting their status to inactive, preserving membership history
   */
  async removeMemberFromGroup(group_id: number, merchant_id: number): Promise<void> {
    // soft delete: set status to 0
    await this.database.update(
      'merchant_group_members',
      {
        group_id: group_id,
        merchant_id: merchant_id,
      },
      { status: 0 }
    );
  }

  /**
   * Set template source merchant
   * Business logic: atomically designate a specific merchant as the template source for a group,
   * ensuring only one source merchant exists per group using transaction
   */
  async setTemplateSource(group_id: number, merchant_id: number): Promise<void> {
    // use transaction
    const transaction = await this.database.startTransaction();

    try {
      // reset all members - clear existing source designation
      await transaction.update(
        'merchant_group_members',
        { group_id: group_id, status: 1 },
        { is_merchant_source: false }
      );

      // set new merchant source
      await transaction.update(
        'merchant_group_members',
        { group_id: group_id, merchant_id: merchant_id, status: 1 },
        { is_merchant_source: true }
      );

      // update group merchant_source_id
      await transaction.update('merchant_groups', { id: group_id }, { merchant_source_id: merchant_id });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get group members
   * Business logic: retrieve all active members of a group with their merchant details,
   * ordered by source status (source first) then by merchant name
   */
  async getGroupMembers(group_id: number): Promise<GroupMemberRecord[]> {
    const query = `
      SELECT 
      m.merchant_name, m.status as merchant_status,
      mgm.id as registry_id, mgm.group_id, mgm.merchant_id, mgm.merchant_code, mgm.is_merchant_source, mgm.status as registry_status
      FROM merchant_group_members mgm
      INNER JOIN merchants m ON mgm.merchant_id = m.id
      WHERE mgm.group_id = ? AND mgm.status = 1 AND m.status = 1
      ORDER BY mgm.is_merchant_source DESC, m.merchant_name ASC
    `;

    return await this.database.query<GroupMemberRecord[]>(query, [group_id]);
  }

  /**
   * Check if group exists
   * Business logic: verify if a group exists and is active in the system
   */
  async groupExists(group_id: number): Promise<boolean> {
    const group = await this.database.findOne('merchant_groups', {
      id: group_id,
      status: 1,
    });
    return group !== null;
  }

  /**
   * Get all groups count
   * Business logic: count total number of active groups, supports search filtering for pagination purposes
   */
  async getAllGroupsCount(params: CommonParams = {}): Promise<number> {
    const { search, status } = params;

    let query = `
      SELECT COUNT(g.id) as total
      FROM merchant_groups g
      WHERE g.status = 1
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND g.name LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    if (status !== undefined) {
      query += ` AND g.status = ?`;
      queryParams.push(status);
    }

    const result = await this.database.query(query, queryParams);
    return result[0]?.total || 0;
  }

  /**
   * Check if merchant is already a member of specific group
   * Business logic: verify if a merchant is already an active member of a specific group to prevent duplicate memberships
   */
  async isMemberOfGroup(group_id: number, merchant_id: number): Promise<boolean> {
    const query = `
      SELECT id 
      FROM merchant_group_members 
      WHERE group_id = ? 
      AND merchant_id = ? 
      AND status = 1
      LIMIT 1
    `;

    const result = await this.database.query(query, [group_id, merchant_id]);
    return result.length > 0;
  }
}
