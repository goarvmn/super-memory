// server/src/modules/merchant/services/GroupService.ts

import {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupsResponse,
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
  async getAllGroups(params?: CommonParams): Promise<GetGroupsResponse> {
    try {
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 6;
      const defaultParams: CommonParams = {
        limit: limit,
        offset: offset,
        ...params,
      };

      const groups = await this.groupRepository.getAllGroups(defaultParams);
      const total = await this.groupRepository.getAllGroupsCount(params);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = currentPage < totalPages;

      return {
        groups,
        pagination: {
          total,
          totalPages,
          currentPage,
          hasNextPage,
        },
      };
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
   * Create group with members (atomic operation)
   */
  async createGroupWithMembers(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse> {
    try {
      // Validate group data
      if (!groupData.name?.trim()) {
        throw new Error('Group name is required');
      }

      if (groupData.name.length < 3) {
        throw new Error('Group name must be at least 3 characters');
      }

      // validate members
      if (!Array.isArray(members) || members.length === 0) {
        throw new Error('At least one member is required');
      }

      // validate source merchant if provided
      if (merchantSourceId) {
        const sourceExists = members.some(member => member.merchant_id === merchantSourceId);
        if (!sourceExists) {
          throw new Error('Source merchant must be one of the selected members');
        }
      }

      // validate members
      for (const member of members) {
        if (!member.merchant_id || !member.merchant_code) {
          throw new Error('All merchants must have valid ID and code');
        }

        // check if merchant is already registered
        const isAlreadyRegistered = await this.merchantRepository.isMerchantRegistered(member.merchant_id);
        if (isAlreadyRegistered) {
          throw new Error(`Merchant ${member.merchant_id} is already registered`);
        }
      }

      return await this.groupRepository.createGroupWithMembersAtomic(groupData, members, merchantSourceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group with members';
      throw new Error(`Create group with members failed: ${errorMessage}`);
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
}
