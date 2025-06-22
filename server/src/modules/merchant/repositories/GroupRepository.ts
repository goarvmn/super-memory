// server/src/modules/merchant/repositories/GroupRepository.ts

import {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  GroupMember,
  GroupSummary,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IGroupRepository } from '../interfaces';

// Add this method to GroupRepository.ts

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

@injectable()
export class GroupRepository implements IGroupRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

  /**
   * Get all groups
   * Bussiness logic: get all active groups and count active members
   */
  async getAllGroups(params: CommonParams = {}): Promise<GroupSummary[]> {
    const { search, status, limit = 9, offset = 0 } = params;

    let query = `
      SELECT 
        g.id, g.name, g.status, g.merchant_source_id,
        COUNT(mgm.id) as member_count
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

    return await this.database.query<GroupSummary[]>(query, queryParams);
  }

  /**
   * Get group detail with members
   * Bussiness logic: get group detail with active members
   */
  async getGroupWithMembers(groupId: number): Promise<GroupWithMembers | null> {
    const group = await this.database.findOne<any>('merchant_groups', {
      id: groupId,
      status: 1,
    });

    if (!group) {
      return null;
    }

    // Get members with merchant details
    const members = await this.getGroupMembers(groupId);

    return {
      ...group,
      member_count: members.length,
      members,
    };
  }

  /**
   * Create new group with members
   * Bussiness logic: create new group with members using atomic transaction
   */
  async createGroupWithMembersAtomic(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse> {
    // start database transaction
    const transaction = await this.database.startTransaction();

    try {
      const result: CreateGroupResponse = {
        groupId: 0,
        groupName: groupData.name,
        membersSuccessCount: 0,
        membersTotalCount: members.length,
        membersFailed: [],
        sourceSet: false,
        sourceMerchantId: merchantSourceId,
      };

      // create group within transaction
      const groupRecord = await transaction.create<GroupRecord>('merchant_groups', {
        name: groupData.name,
        status: groupData.status || 1,
        merchant_source_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      result.groupId = groupRecord.id;

      // add members within same transaction
      for (const member of members) {
        try {
          // determine source merchant
          const isSource = merchantSourceId === member.merchant_id;

          await transaction.create<MemberRecord>('merchant_group_members', {
            group_id: result.groupId,
            merchant_id: member.merchant_id,
            merchant_code: member.merchant_code,
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
            merchant_id: member.merchant_id,
            error: errorMessage,
          });

          if (merchantSourceId === member.merchant_id) {
            result.sourceSet = false;
          }
        }
      }

      if (result.sourceSet && merchantSourceId) {
        await transaction.update(
          'merchant_groups',
          { id: result.groupId },
          {
            merchant_source_id: merchantSourceId,
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
   * Bussiness logic: update group information
   */
  async updateGroup(params: UpdateGroupRequest): Promise<void> {
    const { id, ...updateData } = params;

    await this.database.update('merchant_groups', { id }, updateData);
  }

  /**
   * Delete group
   * Bussiness logic: delete group, soft delete by setting status to 0
   */
  async deleteGroup(groupId: number): Promise<void> {
    await this.database.update('merchant_groups', { id: groupId }, { status: 0 });
  }

  /**
   * Add member to group
   * Bussiness logic: add member to group
   */
  async addMemberToGroup(
    groupId: number,
    merchantId: number,
    merchantCode: string,
    isSource: boolean = false
  ): Promise<void> {
    await this.database.create('merchant_group_members', {
      group_id: groupId,
      merchant_id: merchantId,
      merchant_code: merchantCode,
      is_merchant_source: isSource,
      status: 1,
    });
  }

  /**
   * Remove member from group
   * Bussiness logic: remove member from group
   */
  async removeMemberFromGroup(groupId: number, merchantId: number): Promise<void> {
    // soft delete: set status to 0
    await this.database.update(
      'merchant_group_members',
      {
        group_id: groupId,
        merchant_id: merchantId,
      },
      { status: 0 }
    );
  }

  /**
   * Set template source merchant
   * Bussiness logic: set template source merchant using transaction
   */
  async setTemplateSource(groupId: number, merchantId: number): Promise<void> {
    // use transaction
    const transaction = await this.database.startTransaction();

    try {
      // reset all members
      await transaction.update('merchant_group_members', { group_id: groupId, status: 1 }, { is_merchant_source: 0 });

      // set merchant source
      await transaction.update(
        'merchant_group_members',
        { group_id: groupId, merchant_id: merchantId, status: 1 },
        { is_merchant_source: 1 }
      );

      // update group merchant_source_id
      await transaction.update('merchant_groups', { id: groupId }, { merchant_source_id: merchantId });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get group members
   * Bussiness logic: get group members by group ID, filter out inactive merchants
   */
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const query = `
      SELECT 
        mgm.id, mgm.group_id, mgm.merchant_id, mgm.merchant_code, mgm.is_merchant_source,
        m.name as merchant_name, m.status as merchant_status
      FROM merchant_group_members mgm
      INNER JOIN merchants m ON mgm.merchant_id = m.id
      WHERE mgm.group_id = ? AND mgm.status = 1 AND m.status = 1
      ORDER BY mgm.is_merchant_source DESC, m.name ASC
    `;

    return await this.database.query<GroupMember[]>(query, [groupId]);
  }

  /**
   * Check if group exists
   * Bussiness logic: check if group exists
   */
  async groupExists(groupId: number): Promise<boolean> {
    const group = await this.database.findOne('merchant_groups', {
      id: groupId,
      status: 1,
    });
    return group !== null;
  }

  /**
   * Get all groups count
   * Bussiness logic: get all groups count, filter out inactive groups
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
   * Bussiness logic: check if merchant is already a member of specific group, filter out inactive merchants
   */
  async isMemberOfGroup(groupId: number, merchantId: number): Promise<boolean> {
    const query = `
    SELECT id 
    FROM merchant_group_members 
    WHERE group_id = ? 
    AND merchant_id = ? 
    AND status = 1
    LIMIT 1
  `;

    const result = await this.database.query(query, [groupId, merchantId]);
    return result.length > 0;
  }
}
