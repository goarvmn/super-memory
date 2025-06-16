// client/src/features/auth/hooks/useAuth.ts

import { useAuthStore } from '@/lib/stores';

/**
 * Auth hook - wrapper for auth store
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
};
