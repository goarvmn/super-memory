// shared/src/dto/auth.dto.ts

import { User } from '../types';

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

/**
 * Validate Session Response
 */
export interface ValidateSessionResponse {
  isValid: boolean;
  user?: User;
  expiresAt?: string;
}
