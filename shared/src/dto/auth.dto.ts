// shared/src/dto/auth.dto.ts

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Auth User
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  user_role: number;
  user_type: number;
  is_permanent_delete: number;
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
