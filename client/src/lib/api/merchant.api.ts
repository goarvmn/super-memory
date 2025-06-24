// client/src/lib/api/merchant.api.ts

import {
  GROUP_ENDPOINTS,
  MERCHANT_ENDPOINTS,
  type AddMerchantToRegistryRequest,
  type AddMerchantToRegistryResponse,
  type BaseApiResponse,
  type CreateGroupRequest,
  type CreateGroupResponse,
  type GetGroupsResponse,
  type GetMerchantsResponse,
  type GroupWithMembers,
  type Merchant,
  type UpdateGroupRequest,
  type UpdateMerchantRegistryRequest,
} from '@guesense-dash/shared';
import { apiClient } from './axios.config';

/**
 * Merchant API Client
 */
export class MerchantAPI {
  // ===== MERCHANT ENDPOINTS =====

  /**
   * GET /api/merchants/available
   * Get available merchants (not in registry)
   */
  static async getAvailableMerchants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<Merchant[]> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${MERCHANT_ENDPOINTS.GET_AVAILABLE_MERCHANTS}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<BaseApiResponse<Merchant[]>>(url);

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * GET /api/merchants
   * Get registered merchants with pagination
   */
  static async getRegisteredMerchants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<GetMerchantsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${MERCHANT_ENDPOINTS.GET_REGISTERED_MERCHANTS}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<BaseApiResponse<GetMerchantsResponse>>(url);

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * POST /api/merchants/registry
   * Add merchants to registry (bulk operation)
   */
  static async addMerchantsToRegistry(
    merchants: AddMerchantToRegistryRequest[]
  ): Promise<AddMerchantToRegistryResponse> {
    const response = await apiClient.post<BaseApiResponse<AddMerchantToRegistryResponse>>(
      MERCHANT_ENDPOINTS.ADD_MERCHANTS_TO_REGISTRY,
      merchants
    );

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * PUT /api/merchants/registry/:registryId
   * Update merchant in registry
   */
  static async updateMerchantRegistry(registryId: number, data: UpdateMerchantRegistryRequest): Promise<void> {
    const url = MERCHANT_ENDPOINTS.UPDATE_MERCHANT_REGISTRY.replace(':registryId', registryId.toString());
    await apiClient.put(url, data);
  }

  /**
   * DELETE /api/merchants/registry/:registryId
   * Remove merchant from registry
   */
  static async removeMerchantFromRegistry(registryId: number): Promise<void> {
    const url = MERCHANT_ENDPOINTS.REMOVE_MERCHANT_FROM_REGISTRY.replace(':registryId', registryId.toString());
    await apiClient.delete(url);
  }

  // ===== GROUP ENDPOINTS =====

  /**
   * GET /api/groups
   * Get all groups with pagination
   */
  static async getGroups(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<GetGroupsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${GROUP_ENDPOINTS.GET_ALL_GROUPS}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<BaseApiResponse<GetGroupsResponse>>(url);

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * GET /api/groups/:groupId
   * Get group detail with members
   */
  static async getGroupWithMembers(groupId: number): Promise<GroupWithMembers> {
    const url = GROUP_ENDPOINTS.GET_GROUP_WITH_MEMBERS.replace(':groupId', groupId.toString());
    const response = await apiClient.get<BaseApiResponse<GroupWithMembers>>(url);

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * POST /api/groups/with-members
   * Create group with members (wizard flow)
   */
  static async createGroupWithMembers(
    groupData: CreateGroupRequest,
    members: AddMerchantToRegistryRequest[],
    merchantSourceId?: number
  ): Promise<CreateGroupResponse> {
    const payload = {
      groupData,
      members,
      merchantSourceId,
    };

    const response = await apiClient.post<BaseApiResponse<CreateGroupResponse>>(
      GROUP_ENDPOINTS.CREATE_GROUP_WITH_MEMBERS,
      payload
    );

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * PUT /api/groups/:groupId
   * Update group information
   */
  static async updateGroup(groupId: number, data: UpdateGroupRequest): Promise<void> {
    const url = GROUP_ENDPOINTS.UPDATE_GROUP.replace(':groupId', groupId.toString());
    await apiClient.put(url, data);
  }

  /**
   * DELETE /api/groups/:groupId
   * Delete group
   */
  static async deleteGroup(groupId: number): Promise<void> {
    const url = GROUP_ENDPOINTS.DELETE_GROUP.replace(':groupId', groupId.toString());
    await apiClient.delete(url);
  }

  /**
   * POST /api/groups/:groupId/members
   * Add merchants to group
   */
  static async addMerchantsToGroup(
    groupId: number,
    members: AddMerchantToRegistryRequest[]
  ): Promise<AddMerchantToRegistryResponse> {
    const url = GROUP_ENDPOINTS.ADD_MERCHANTS_TO_GROUP.replace(':groupId', groupId.toString());
    const response = await apiClient.post<BaseApiResponse<AddMerchantToRegistryResponse>>(url, members);

    if (!response.data?.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  }

  /**
   * DELETE /api/groups/:groupId/members/:merchantId
   * Remove member from group
   */
  static async removeMemberFromGroup(groupId: number, merchantId: number): Promise<void> {
    const url = GROUP_ENDPOINTS.REMOVE_MEMBER_FROM_GROUP.replace(':groupId', groupId.toString()).replace(
      ':merchantId',
      merchantId.toString()
    );
    await apiClient.delete(url);
  }

  /**
   * PUT /api/groups/:groupId/source/:merchantId
   * Set template source merchant
   */
  static async setTemplateSource(groupId: number, merchantId: number): Promise<void> {
    const url = GROUP_ENDPOINTS.SET_TEMPLATE_SOURCE.replace(':groupId', groupId.toString()).replace(
      ':merchantId',
      merchantId.toString()
    );
    await apiClient.put(url);
  }
}

/**
 * Export as merchantApi for consistency with store usage
 */
export const merchantApi = MerchantAPI;
