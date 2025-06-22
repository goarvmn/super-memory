// shared/src/dto/index.ts

// Export base response wrapper DTO
export type { BaseApiResponse } from './common.dto';

// Export auth DTOs
export type { LoginRequest, LoginResponse, ValidateSessionResponse } from './auth.dto';

// Export merchant DTOs
export type {
  AddMerchantToRegistryRequest,
  AddMerchantToRegistryResponse,
  BulkAddMerchantsResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupsRequest,
  GetGroupsResponse,
  GetMerchantsRequest,
  GetMerchantsResponse,
  UpdateGroupRequest,
  UpdateMerchantRegistryRequest,
} from './merchant.dto';
