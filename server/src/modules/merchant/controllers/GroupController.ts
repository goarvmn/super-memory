// server/src/modules/merchant/controllers/GroupController.ts

import {
  AddMerchantToRegistryRequest,
  BaseApiResponse,
  BulkAddMerchantsResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupsResponse,
  GroupErrorCode,
  GroupWithMembers,
  UpdateGroupRequest,
} from '@guesense-dash/shared';
import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../shared';
import { paginationToOffset } from '../../../shared/utils';
import { AuthenticatedRequest } from '../../auth/middleware/AuthMiddleware';
import { IGroupService } from '../interfaces';

/**
 * Group Controller
 * Handles group REST endpoints
 */
@injectable()
export class GroupController {
  constructor(@inject(DI_TYPES.IGroupService) private groupService: IGroupService) {}

  /**
   * GET /api/groups
   * Get all groups with pagination
   */
  getAllGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 6, search, status } = req.query;

      // Convert pagination
      const { offset } = paginationToOffset(Number(page), Number(limit));

      const response = await this.groupService.getAllGroups({
        search: search as string,
        status: status ? Number(status) : undefined,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<GetGroupsResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get groups';

      res.status(500).json({
        success: false,
        error: {
          code: GroupErrorCode.GET_GROUPS_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * GET /api/groups/:groupId
   * Get group detail with members
   */
  getGroupWithMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);

      const group = await this.groupService.getGroupWithMembers(groupId);

      res.status(200).json({
        success: true,
        data: group,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<GroupWithMembers>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get group details';

      // Simple error mapping based on service error message
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_NOT_FOUND
        : GroupErrorCode.GET_GROUP_DETAILS_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * POST /api/groups/with-members
   * Create group with members (wizard flow)
   */
  createGroupWithMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { groupData, members, merchantSourceId } = req.body as {
        groupData: CreateGroupRequest;
        members: AddMerchantToRegistryRequest[];
        merchantSourceId?: number;
      };

      // Basic request format validation only
      if (!groupData || !Array.isArray(members)) {
        res.status(400).json({
          success: false,
          error: {
            code: GroupErrorCode.VALIDATION_ERROR,
            message: 'Invalid request format: expected groupData and members array',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      // Service handles all business validation
      const result = await this.groupService.createGroupWithMembers(groupData, members, merchantSourceId);

      // HTTP status based on result
      const statusCode = result.membersFailed.length > 0 ? 207 : 201; // 207 Multi-Status if partial success

      res.status(statusCode).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<CreateGroupResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group with members';

      res.status(500).json({
        success: false,
        error: {
          code: GroupErrorCode.CREATE_GROUP_ERROR,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * PUT /api/groups/:groupId
   * Update group information
   */
  updateGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);
      const updateData = req.body as Omit<UpdateGroupRequest, 'id'>;

      await this.groupService.updateGroup({
        id: groupId,
        ...updateData,
      });

      res.status(200).json({
        success: true,
        data: { message: 'Group updated successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update group';

      // Simple error mapping
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_NOT_FOUND
        : GroupErrorCode.UPDATE_GROUP_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * DELETE /api/groups/:groupId
   * Delete group (soft delete)
   */
  deleteGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);

      await this.groupService.deleteGroup(groupId);

      res.status(200).json({
        success: true,
        data: { message: 'Group deleted successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';

      // Simple error mapping
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_NOT_FOUND
        : GroupErrorCode.DELETE_GROUP_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * POST /api/groups/:groupId/members
   * Add merchants to group (bulk operation)
   */
  addMerchantsToGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);
      const merchants = req.body;

      // Basic request format validation only
      if (!Array.isArray(merchants)) {
        res.status(400).json({
          success: false,
          error: {
            code: GroupErrorCode.VALIDATION_ERROR,
            message: 'Expected array of merchants',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      // Service handles all business validation
      const result = await this.groupService.addMerchantsToGroup(groupId, merchants);

      // HTTP status based on result
      const statusCode = result.failed.length > 0 ? 207 : 200; // 207 Multi-Status if partial success

      res.status(statusCode).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<BulkAddMerchantsResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add merchants to group';

      // Simple error mapping
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_NOT_FOUND
        : GroupErrorCode.ADD_MERCHANTS_TO_GROUP_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * DELETE /api/groups/:groupId/members/:merchantId
   * Remove member from group
   */
  removeMemberFromGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);
      const merchantId = Number(req.params.merchantId);

      // Service handles all validation
      await this.groupService.removeMemberFromGroup(groupId, merchantId);

      res.status(200).json({
        success: true,
        data: { message: 'Member removed from group successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member from group';

      // Simple error mapping
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_OR_MEMBER_NOT_FOUND
        : GroupErrorCode.REMOVE_MEMBER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * PUT /api/groups/:groupId/source/:merchantId
   * Set template source merchant
   */
  setTemplateSource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const groupId = Number(req.params.groupId);
      const merchantId = Number(req.params.merchantId);

      // Service handles all validation
      await this.groupService.setTemplateSource(groupId, merchantId);

      res.status(200).json({
        success: true,
        data: { message: 'Template source set successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set template source';

      // Simple error mapping
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      const errorCode = errorMessage.includes('not found')
        ? GroupErrorCode.GROUP_OR_MEMBER_NOT_FOUND
        : GroupErrorCode.SET_TEMPLATE_SOURCE_ERROR;

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };
}
