// shared/src/api/merchant.api.ts

/**
 * Merchant API Endpoints
 */
export const MERCHANT_ENDPOINTS = {
  // Merchant endpoints
  GET_AVAILABLE_MERCHANTS: '/merchants/available',
  GET_REGISTERED_MERCHANTS: '/merchants',
  ADD_MERCHANTS_TO_REGISTRY: '/merchants/registry',
  UPDATE_MERCHANT_REGISTRY: '/merchants/registry/:registryId',
  REMOVE_MERCHANT_FROM_REGISTRY: '/merchants/registry/:registryId',
} as const;

/**
 * Group API Endpoints
 */
export const GROUP_ENDPOINTS = {
  // Group CRUD
  GET_ALL_GROUPS: '/groups',
  GET_GROUP_WITH_MEMBERS: '/groups/:groupId',
  CREATE_GROUP_WITH_MEMBERS: '/groups/with-members',
  UPDATE_GROUP: '/groups/:groupId',
  DELETE_GROUP: '/groups/:groupId',

  // Group member management
  ADD_MERCHANTS_TO_GROUP: '/groups/:groupId/members',
  REMOVE_MEMBER_FROM_GROUP: '/groups/:groupId/members/:merchantId',
  SET_TEMPLATE_SOURCE: '/groups/:groupId/source/:merchantId',
} as const;
