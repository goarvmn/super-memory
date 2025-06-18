// shared/src/api/auth.ts

/**
 * Auth API endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VALIDATE: '/auth/validate',
  ME: '/auth/me',
} as const;
