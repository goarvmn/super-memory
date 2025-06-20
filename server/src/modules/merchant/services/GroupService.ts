// server/src/modules/merchant/services/GroupService.ts

import {
  CreateGroupRequest,
  GroupMember,
  GroupSummary,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import { CommonParams } from '../../../shared/types/common';
import { DI_TYPES } from '../../../shared/types/container';
import { IGroupRepository, IGroupService, IMerchantRepository } from '../interfaces';

/**
 * Group Service Implementation
 */
@injectable()
export class GroupService implements IGroupService {
  constructor(
    @inject(DI_TYPES.IGroupRepository)
    private groupRepository: IGroupRepository,
    @inject(DI_TYPES.IMerchantRepository)
    private merchantRepository: IMerchantRepository
  ) {}

  /**
   * Get all groups for "Groups" tab
   */
  async getAllGroups(params?: CommonParams): Promise<GroupSummary[]> {
    try {
      const defaultParams: CommonParams = {
        limit: 6,
        offset: 0,
        ...params,
      };

      return await this.groupRepository.getAllGroups(defaultParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get groups';
      throw new Error(`Get groups failed: ${errorMessage}`);
    }
  }

  /**
   * Get group detail with members
   */
  async getGroupWithMembers(groupId: number): Promise<GroupWithMembers> {
    try {
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }

      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      const group = await this.groupRepository.getGroupWithMembers(groupId);
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }

      return group;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get group details';
      throw new Error(`Get group details failed: ${errorMessage}`);
    }
  }

  /**
   * Create new group
   */
  async createGroup(params: CreateGroupRequest): Promise<number> {
    try {
      if (!params.name?.trim()) {
        throw new Error('Group name is required');
      }

      if (params.name.length < 3) {
        throw new Error('Group name must be at least 3 characters');
      }

      const groupId = await this.groupRepository.createGroup(params);

      return groupId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      throw new Error(`Create group failed: ${errorMessage}`);
    }
  }

  /**
   * Update group information
   */
  async updateGroup(params: UpdateGroupRequest): Promise<void> {
    try {
      if (!params.id || params.id <= 0) {
        throw new Error('Valid group ID is required');
      }

      const groupExists = await this.groupRepository.groupExists(params.id);
      if (!groupExists) {
        throw new Error(`Group ${params.id} not found`);
      }

      if (params.name !== undefined && (!params.name?.trim() || params.name.length < 3)) {
        throw new Error('Group name must be at least 3 characters');
      }

      await this.groupRepository.updateGroup(params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update group';
      throw new Error(`Update group failed: ${errorMessage}`);
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: number): Promise<void> {
    try {
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }

      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      await this.groupRepository.deleteGroup(groupId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
      throw new Error(`Delete group failed: ${errorMessage}`);
    }
  }

  /**
   * Add merchant to group
   */
  async addMemberToGroup(groupId: number, merchantId: number, merchantCode: string, isSource?: boolean): Promise<void> {
    try {
      // Validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchantId || merchantId <= 0) {
        throw new Error('Valid merchant ID is required');
      }
      if (!merchantCode?.trim()) {
        throw new Error('Merchant code is required');
      }

      // Check if group exists
      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      // Check if merchant is registered
      const isRegistered = await this.merchantRepository.isMerchantRegistered(merchantId);
      if (!isRegistered) {
        throw new Error(`Merchant ${merchantId} is not registered`);
      }

      // Business logic: If setting as template source, unset previous source
      if (isSource) {
        await this.groupRepository.setTemplateSource(groupId, merchantId);
      } else {
        await this.groupRepository.addMemberToGroup(groupId, merchantId, merchantCode, false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add member to group';
      throw new Error(`Add member to group failed: ${errorMessage}`);
    }
  }

  /**
   * Remove member from group
   */
  async removeMemberFromGroup(groupId: number, merchantId: number): Promise<void> {
    try {
      // Validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchantId || merchantId <= 0) {
        throw new Error('Valid merchant ID is required');
      }

      // Check if group exists
      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      await this.groupRepository.removeMemberFromGroup(groupId, merchantId);

      // Note: Member automatically becomes individual merchant due to group_id set to null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member from group';
      throw new Error(`Remove member from group failed: ${errorMessage}`);
    }
  }

  /**
   * Set template source merchant
   */
  async setTemplateSource(groupId: number, merchantId: number): Promise<void> {
    try {
      // Validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchantId || merchantId <= 0) {
        throw new Error('Valid merchant ID is required');
      }

      // Check if group exists
      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      // Business logic: Merchant must be member of the group
      const members = await this.groupRepository.getGroupMembers(groupId);
      const merchantInGroup = members.find(member => member.merchant_id === merchantId);

      if (!merchantInGroup) {
        throw new Error(`Merchant ${merchantId} is not a member of group ${groupId}`);
      }

      await this.groupRepository.setTemplateSource(groupId, merchantId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set template source';
      throw new Error(`Set template source failed: ${errorMessage}`);
    }
  }

  /**
   * Get group members only (helper method)
   */
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    try {
      // Validate group ID
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }

      // Check if group exists
      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      return await this.groupRepository.getGroupMembers(groupId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get group members';
      throw new Error(`Get group members failed: ${errorMessage}`);
    }
  }
}
