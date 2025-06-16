// server/src/modules/auth/interfaces/IAuthService.ts

import { LoginRequest, LoginResponse, ValidateSessionResponse } from '@guesense-dash/shared';

/**
 * Authentication Service Interface
 */

export interface IAuthService {
  /**
   * Proxy login request to GOA Service
   */
  loginProxy(credentials: LoginRequest): Promise<LoginResponse>;

  /**
   * Validate current session token
   */
  validateSession(sessionToken: string): Promise<ValidateSessionResponse>;

  /**
   * Logout and clear session
   */
  logout(sessionToken: string): Promise<void>;
}
