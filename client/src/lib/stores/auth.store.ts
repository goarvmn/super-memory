// client/src/lib/stores/auth.store.ts

import { type LoginRequest, type User } from '@guesense-dash/shared/dto';
import { create } from 'zustand';
import { authApi } from '../api';
import { storage } from '../utils/storage';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  // Simple initial state
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to prevent redirect

  // Login action
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error (but continuing):', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Check authentication status
  checkAuth: async () => {
    // No token = not authenticated
    if (!storage.hasToken()) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });

    try {
      const user = await authApi.me();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token invalid, clear it
      storage.removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
