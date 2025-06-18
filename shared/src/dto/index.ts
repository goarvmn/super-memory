// shared/src/dto/index.ts

// Export base response wrapper DTO
export type { BaseApiResponse } from './base.dto';

// Export auth DTOs
export type { LoginRequest, LoginResponse, User, ValidateSessionResponse } from './auth.dto';

// Export merchant DTOs
export type {
  GetMerchantsRequest,
  GetMerchantsResponse,
  SyncMerchantRequest,
  SyncMerchantResponse,
  UpdateMerchantRequest,
  UpdateMerchantResponse,
} from './merchant.dto';

// Export group DTOs
export type {
  AddGroupMemberRequest,
  AddGroupMemberResponse,
  ApplyTemplateRequest,
  ApplyTemplateResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  GetGroupMembersRequest,
  GetGroupMembersResponse,
  GetGroupsRequest,
  GetGroupsResponse,
  RemoveGroupMemberRequest,
  RemoveGroupMemberResponse,
  SyncGroupRequest,
  SyncGroupResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
} from './group.dto';
