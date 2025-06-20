// shared/src/dto/merchant.dto.ts

export interface GetMerchantsRequest {
  search?: string;
  status?: number;
  limit?: number;
  offset?: number;
}

export interface AddMerchantToRegistryRequest {
  merchant_id: number;
  merchant_code: string;
  group_id?: number | null;
  is_merchant_source?: boolean;
}

export interface UpdateMerchantRegistryRequest {
  registry_id: number;
  group_id?: number | null;
  status?: boolean;
  is_merchant_source?: boolean;
}

export interface GetGroupsRequest {
  search?: string;
  status?: number;
  limit?: number;
  offset?: number;
}

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
