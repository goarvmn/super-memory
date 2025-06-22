// server/src/modules/merchant/services/GroupService.ts

import {
  AddMerchantToRegistryRequest,
  BulkAddMerchantsResponse,
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
   * Get all groups
   * Bussiness logic: get all groups with pagination
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
   * Bussiness logic: get group detail with active members
   */
  async getGroupWithMembers(groupId: number): Promise<GroupWithMembers> {
    try {
      // validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }

      // validate group exists
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
   * Create new group with members
   * Bussiness logic: create new group with members
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
   * Update group
   * Bussiness logic: update group information
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
   * Bussiness logic: remove group from list
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
   * Add merchant(s) to group
   * Bussiness logic: add merchant(s) to group with bulk operation
   */
  async addMerchantsToGroup(
    groupId: number,
    merchants: AddMerchantToRegistryRequest[]
  ): Promise<BulkAddMerchantsResponse> {
    try {
      // validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }

      if (!Array.isArray(merchants) || merchants.length === 0) {
        throw new Error('At least one merchant is required');
      }

      // check if group exists
      const groupExists = await this.groupRepository.groupExists(groupId);
      if (!groupExists) {
        throw new Error(`Group ${groupId} not found`);
      }

      const result: BulkAddMerchantsResponse = {
        successCount: 0,
        totalCount: merchants.length,
        failed: [],
      };

      for (const merchant of merchants) {
        try {
          // validate merchant data
          if (!merchant.merchant_id || !merchant.merchant_code?.trim()) {
            result.failed.push({
              merchant_id: merchant.merchant_id || 0,
              error: 'Merchant ID and code are required',
            });
            continue;
          }

          // check if merchant is already in this group
          const isInGroup = await this.groupRepository.isMemberOfGroup(groupId, merchant.merchant_id);
          if (isInGroup) {
            result.failed.push({
              merchant_id: merchant.merchant_id,
              error: `Merchant ${merchant.merchant_id} is already in this group`,
            });
            continue;
          }

          // register merchant if not already registered
          const isRegistered = await this.merchantRepository.isMerchantRegistered(merchant.merchant_id);
          if (!isRegistered) {
            await this.merchantRepository.addMerchantToRegistry(merchant);
          }

          await this.groupRepository.addMemberToGroup(groupId, merchant.merchant_id, merchant.merchant_code, false);
          result.successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to process merchant';
          result.failed.push({
            merchant_id: merchant.merchant_id,
            error: errorMessage,
          });
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to group';
      throw new Error(`Add merchants to group failed: ${errorMessage}`);
    }
  }

  /**
   * Remove member from group
   * Bussiness logic: remove member from group
   */
  async removeMemberFromGroup(groupId: number, merchantId: number): Promise<void> {
    try {
      // validate inputs
      if (!groupId || groupId <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchantId || merchantId <= 0) {
        throw new Error('Valid merchant ID is required');
      }

      // check if group exists
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
