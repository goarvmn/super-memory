// shared/src/dto/index.ts

// Export base response wrapper DTO
export type { BaseApiResponse } from './base.dto';

// Export auth DTOs
export type { LoginRequest, LoginResponse, ValidateSessionResponse } from './auth.dto';

// Export merchant DTOs
export type {
  AddMerchantToRegistryRequest,
  CreateGroupRequest,
  GetGroupsRequest,
  GetMerchantsRequest,
  UpdateGroupRequest,
  UpdateMerchantRegistryRequest,
} from './merchant.dto';
