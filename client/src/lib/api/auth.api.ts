// client/src/lib/api/auth.api.ts

import type {
  BaseApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  ValidateSessionResponse,
} from '@guesense-dash/shared';
import { AUTH_ENDPOINTS } from '@guesense-dash/shared';
import { storage } from '../utils/storage';
import { apiClient } from './axios.config';

/**
 * Auth API methods
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<BaseApiResponse<LoginResponse>>(AUTH_ENDPOINTS.LOGIN, credentials);

    if (response.data.success && response.data.data) {
      // Store token on successful login
      storage.setToken(response.data.data.token);
      return response.data.data;
    }

    throw new Error('Login failed');
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      // Always clear token, even if request fails
      storage.removeToken();
    }
  },

  /**
   * Validate current session
   */
  async validate(): Promise<ValidateSessionResponse> {
    const response = await apiClient.get<BaseApiResponse<ValidateSessionResponse>>(AUTH_ENDPOINTS.VALIDATE);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Session validation failed');
  },

  /**
   * Get current user info
   */
  async me(): Promise<User> {
    const response = await apiClient.get<BaseApiResponse<{ user: User }>>(AUTH_ENDPOINTS.ME);

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error('Failed to get user info');
  },
};
