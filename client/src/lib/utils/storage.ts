// client/src/lib/utils/storage.ts

const TOKEN_KEY = 'guesense_token';

/**
 * Token storage utilities
 */
export const storage = {
  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Store token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove token
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
