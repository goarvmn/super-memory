// server/src/modules/auth/types/AuthTypes.ts

/**
 * Authentication Custom Types
 */

/**
 * User roles enum for basic access control
 */
export enum UserRole {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  TECHNICAL_SUPPORT = 61,
}

/**
 * User types enum for basic categorization
 */
export enum UserType {
  INTERNAL = 1,
}

/**
 * JWT token payload structure
 */
export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Basic authentication options
 */
export interface AuthOptions {
  sessionDuration: number; // in milliseconds
  jwtSecret: string;
}
