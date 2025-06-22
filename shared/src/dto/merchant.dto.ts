// shared/src/dto/merchant.dto.ts

import { PaginationRequest, SearchFilter, StatusFilter } from './common.dto';

export interface GetMerchantsRequest extends PaginationRequest, StatusFilter, SearchFilter {}

export interface AddMerchantToRegistryRequest {
  merchant_id: number;
  merchant_code: string;
}

export interface UpdateMerchantRegistryRequest {
  registry_id: number;
  group_id?: number | null;
  status?: boolean;
}

export interface GetGroupsRequest extends PaginationRequest, SearchFilter, StatusFilter {}

export interface CreateGroupRequest {
  name: string;
  status?: number;
}

export interface UpdateGroupRequest {
  id: number;
  name?: string;
  status?: number;
  merchant_source_id?: number | null;
}

export interface BulkAddResult {
  successCount: number;
  totalCount: number;
  failed: Array<{
    merchant_id: number;
    error: string;
  }>;
}

export interface GroupCreationResult {
  groupId: number;
  groupName: string;
  membersSuccessCount: number;
  membersTotalCount: number;
  membersFailed: Array<{
    merchant_id: number;
    error: string;
  }>;
  sourceSet: boolean;
  sourceMerchantId?: number;
}
