// shared/src/dto/merchant.dto.ts

import { GroupSummary, MerchantRegistryWithStats } from '../types';
import { PaginationRequest, SearchFilter, StatusFilter } from './common.dto';

export interface GetMerchantsRequest extends PaginationRequest, StatusFilter, SearchFilter {}

export interface GetMerchantsResponse {
  merchants: MerchantRegistryWithStats[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

export interface AddMerchantToRegistryRequest {
  id: number;
  code: string;
  group_id?: number | null;
  is_merchant_source?: boolean | null;
}

export interface AddMerchantToRegistryResponse {
  successCount: number;
  totalCount: number;
  failed: Array<{
    code: string;
    error: string;
  }>;
}

export interface UpdateMerchantRegistryRequest {
  registryId: number;
  // field to be updated
  groupId?: number | null;
  registryStatus?: number;
}

export interface GetGroupsRequest extends PaginationRequest, SearchFilter, StatusFilter {}

export interface GetGroupsResponse {
  groups: GroupSummary[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

export interface CreateGroupRequest {
  name: string;
  status?: number;
}

export interface CreateGroupResponse {
  groupId: number;
  groupName: string;
  membersSuccessCount: number;
  membersTotalCount: number;
  membersFailed: Array<{
    code: string;
    error: string;
  }>;
  sourceSet: boolean;
  sourceMerchantId?: number;
}

export interface UpdateGroupRequest {
  id: number;
  name?: string;
  status?: number;
  merchantSourceId?: number | null;
  membersCount?: number;
}

export interface BulkAddMerchantsResponse {
  successCount: number;
  totalCount: number;
  failed: Array<{
    code: string;
    error: string;
  }>;
}
