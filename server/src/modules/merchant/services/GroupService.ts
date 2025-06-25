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
   * Business logic: retrieve all active groups with member counts, pagination support, and total count calculation
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
   * Business logic: retrieve group information along with all active members, includes validation to ensure group exists
   */
  async getGroupWithMembers(group_id: number): Promise<GroupWithMembers> {
    try {
      // validate inputs
      if (!group_id || group_id <= 0) {
        throw new Error('Valid group ID is required');
      }

      // validate group exists
      const groupExists = await this.groupRepository.groupExists(group_id);
      if (!groupExists) {
        throw new Error(`Group ${group_id} not found`);
      }

      const group = await this.groupRepository.getGroupWithMembers(group_id);
      if (!group) {
        throw new Error(`Group ${group_id} not found`);
      }

      return group;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get group details';
      throw new Error(`Get group details failed: ${errorMessage}`);
    }
  }

  /**
   * Create new group with members
   * Business logic: atomically create a new group with initial members (not yet registered in registry), validates group name, member data,
   * checks for duplicate registrations, and optionally designates a source merchant
   */
  async createGroupWithMembers(
    group_data: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchant_source_id?: number
  ): Promise<CreateGroupResponse> {
    try {
      // Validate group data
      if (!group_data.name?.trim()) {
        throw new Error('Group name is required');
      }

      if (group_data.name.length < 3) {
        throw new Error('Group name must be at least 3 characters');
      }

      // validate members
      if (!Array.isArray(members) || members.length === 0) {
        throw new Error('At least one member is required');
      }

      // validate source merchant if provided
      if (merchant_source_id) {
        const sourceExists = members.some(member => member.id === merchant_source_id);
        if (!sourceExists) {
          throw new Error('Source merchant must be one of the selected members');
        }
      }

      // validate members
      for (const member of members) {
        if (!member.id || !member.code) {
          throw new Error('All merchants must have valid ID and code');
        }

        // check if merchant is already registered
        const registeredMerchant = await this.merchantRepository.findRegisteredMerchant({ merchant_id: member.id });
        if (registeredMerchant) {
          throw new Error(`Merchant "${member.code}" is already registered`);
        }
      }

      return await this.groupRepository.createGroupWithMembersAtomic(group_data, members, merchant_source_id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group with members';
      throw new Error(`Create group with members failed: ${errorMessage}`);
    }
  }

  /**
   * Update group
   * Business logic: update group information with validation to ensure group exists and name meets minimum requirements
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
   * Business logic: soft delete a group by setting status to inactive, preserves data for audit purposes with validation
   */
  async deleteGroup(group_id: number): Promise<void> {
    try {
      if (!group_id || group_id <= 0) {
        throw new Error('Valid group ID is required');
      }

      const groupExists = await this.groupRepository.groupExists(group_id);
      if (!groupExists) {
        throw new Error(`Group ${group_id} not found`);
      }

      await this.groupRepository.deleteGroup(group_id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
      throw new Error(`Delete group failed: ${errorMessage}`);
    }
  }

  /**
   * Add merchant(s) to group
   * Business logic: bulk add multiple merchants to an existing group, automatically registers unregistered merchants,
   * validates duplicate memberships, and provides detailed success/failure reporting
   */
  async addMerchantsToGroup(
    group_id: number,
    merchants: AddMerchantToRegistryRequest[]
  ): Promise<BulkAddMerchantsResponse> {
    try {
      // validate inputs
      if (!group_id || group_id <= 0) {
        throw new Error('Valid group ID is required');
      }

      if (!Array.isArray(merchants) || merchants.length === 0) {
        throw new Error('At least one merchant is required');
      }

      // check if group exists
      const groupExists = await this.groupRepository.groupExists(group_id);
      if (!groupExists) {
        throw new Error(`Group ${group_id} not found`);
      }

      const result: BulkAddMerchantsResponse = {
        successCount: 0,
        totalCount: merchants.length,
        failed: [],
      };

      // Process all merchants in parallel
      const results = await Promise.allSettled(
        merchants.map((merchant, index) => this.processMerchantForGroup(merchant, group_id, index))
      );

      // Collect results
      results.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          result.successCount++;
        } else {
          result.failed.push({
            code: merchants[index].code || 'unknown',
            error: promiseResult.reason.message,
          });
        }
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to group';
      throw new Error(`Add merchants to group failed: ${errorMessage}`);
    }
  }

  /**
   * Remove member from group
   * Business logic: soft delete a member from group, member automatically becomes individual merchant,
   * validates group and member existence before removal
   */
  async removeMemberFromGroup(group_id: number, merchant_id: number): Promise<void> {
    try {
      // validate inputs
      if (!group_id || group_id <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchant_id || merchant_id <= 0) {
        throw new Error('Valid merchant ID is required');
      }

      // check if group exists
      const groupExists = await this.groupRepository.groupExists(group_id);
      if (!groupExists) {
        throw new Error(`Group ${group_id} not found`);
      }

      await this.groupRepository.removeMemberFromGroup(group_id, merchant_id);

      // Note: Member automatically becomes individual merchant due to group_id set to null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member from group';
      throw new Error(`Remove member from group failed: ${errorMessage}`);
    }
  }

  /**
   * Set template source merchant
   * Business logic: atomically designate a merchant as the template source for a group,
   * validates that merchant is an active member of the group before setting as source
   */
  async setTemplateSource(group_id: number, merchant_id: number): Promise<void> {
    try {
      // Validate inputs
      if (!group_id || group_id <= 0) {
        throw new Error('Valid group ID is required');
      }
      if (!merchant_id || merchant_id <= 0) {
        throw new Error('Valid merchant ID is required');
      }

      // Check if group exists
      const groupExists = await this.groupRepository.groupExists(group_id);
      if (!groupExists) {
        throw new Error(`Group ${group_id} not found`);
      }

      // Business logic: Merchant must be member of the group
      const members = await this.groupRepository.getGroupMembers(group_id);
      const merchantInGroup = members.find(member => member.merchant_id === merchant_id);

      if (!merchantInGroup) {
        throw new Error(`Merchant ${merchant_id} is not a member of group ${group_id}`);
      }

      await this.groupRepository.setTemplateSource(group_id, merchant_id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set template source';
      throw new Error(`Set template source failed: ${errorMessage}`);
    }
  }

  /**
   * Process single merchant addition to group
   * Private method to handle individual merchant processing with validation and registration
   */
  private async processMerchantForGroup(
    merchant: AddMerchantToRegistryRequest,
    group_id: number,
    _index: number
  ): Promise<void> {
    // validate merchant data
    if (!merchant.id || !merchant.code?.trim()) {
      throw new Error('Merchant ID and code are required');
    }

    // check if merchant is already in this group
    const isInGroup = await this.groupRepository.isMemberOfGroup(group_id, merchant.id);
    if (isInGroup) {
      throw new Error(`Merchant "${merchant.code}" is already in this group`);
    }

    // register merchant if not already registered
    const registeredMerchant = await this.merchantRepository.findRegisteredMerchant({
      merchant_id: merchant.id,
    });

    if (!registeredMerchant) {
      await this.merchantRepository.addMerchantToRegistry(merchant);
    }

    // assign merchant to group
    await this.groupRepository.assignMemberToGroup(group_id, merchant.id, merchant.is_merchant_source ?? false);
  }
}
