// shared/src/api/merchant.api.ts

/**
 * Merchant API Endpoints
 */
export const MERCHANT_ENDPOINTS = {
  LIST: '/api/merchants',
  DETAIL: (merchantId: string) => `/api/merchants/${merchantId}`,
  UPDATE: (merchantId: string) => `/api/merchants/${merchantId}`,
  SYNC: (merchantId: string) => `/api/merchants/${merchantId}/sync`,
} as const;

/**
 * Group API Endpoints
 */
export const GROUP_ENDPOINTS = {
  LIST: '/api/groups',
  CREATE: '/api/groups',
  DETAIL: (groupId: number) => `/api/groups/${groupId}`,
  UPDATE: (groupId: number) => `/api/groups/${groupId}`,
  DELETE: (groupId: number) => `/api/groups/${groupId}`,
  MEMBERS: (groupId: number) => `/api/groups/${groupId}/members`,
  ADD_MEMBER: (groupId: number) => `/api/groups/${groupId}/members`,
  REMOVE_MEMBER: (groupId: number, merchantId: string) => `/api/groups/${groupId}/members/${merchantId}`,
  SYNC: (groupId: number) => `/api/groups/${groupId}/sync`,
  APPLY_TEMPLATE: (groupId: number) => `/api/groups/${groupId}/apply-template`,
} as const;
