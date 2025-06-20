// server/src/modules/merchant/repositories/GroupRepository.ts

import {
  CreateGroupRequest,
  GroupMember,
  GroupSummary,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { DatabasePort } from '../../../infrastructure/adapters/database/DatabasePort';
import { CommonParams, DI_TYPES } from '../../../shared';
import { IGroupRepository } from '../interfaces';

@injectable()
export class GroupRepository implements IGroupRepository {
  constructor(@inject(DI_TYPES.Database) private database: DatabasePort) {}

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

  async createGroup(params: CreateGroupRequest): Promise<number> {
    const group = await this.database.create<any>('merchant_groups', {
      name: params.name,
      status: params.status ?? 1,
      merchant_source_id: params.merchant_source_id || null,
    });

    return group.id;
  }

  async updateGroup(params: UpdateGroupRequest): Promise<void> {
    const { id, ...updateData } = params;

    await this.database.update('merchant_groups', { id }, updateData);
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.database.update('merchant_groups', { id: groupId }, { status: 0 });
  }

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

  async groupExists(groupId: number): Promise<boolean> {
    const group = await this.database.findOne('merchant_groups', {
      id: groupId,
      status: 1,
    });
    return group !== null;
  }
}
