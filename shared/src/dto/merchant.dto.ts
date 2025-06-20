// shared/src/dto/merchant.dto.ts

import { PaginationRequest, SearchFilter, StatusFilter } from './common.dto';

export interface GetMerchantsRequest extends PaginationRequest, StatusFilter, SearchFilter {}

export interface AddMerchantToRegistryRequest {
  merchant_id: number;
  merchant_code: string;
  group_id?: number;
}

export interface UpdateMerchantRegistryRequest {
  registry_id: number;
  group_id?: number | null;
  status?: boolean;
  is_merchant_source?: boolean;
}

export interface GetGroupsRequest extends PaginationRequest, SearchFilter, StatusFilter {}

export interface CreateGroupRequest {
  name: string;
  status?: number;
  merchant_source_id?: number | null;
}

export interface UpdateGroupRequest {
  id: number;
  name?: string;
  status?: number;
  merchant_source_id?: number | null;
}
