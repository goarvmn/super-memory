// server/src/modules/auth/interfaces/ISessionStore.ts

/**
 * Session Storage Interface
 * Handles session storage operations (in-memory or Redis)
 */

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  name: string;
  user_role: number;
  user_type: number;
  is_permanent_delete: number;
  serviceBToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

export interface ISessionStore {
  /**
   * Store session data
   */
  set(sessionToken: string, sessionData: SessionData): Promise<void>;

  /**
   * Retrieve session data by token
   */
  get(sessionToken: string): Promise<SessionData | null>;

  /**
   * Check if session exists and is valid
   */
  exists(sessionToken: string): Promise<boolean>;

  /**
   * Remove session from store
   */
  delete(sessionToken: string): Promise<void>;

  /**
   * Update last activity timestamp
   */
  updateActivity(sessionToken: string): Promise<void>;

  /**
   * Clean up expired sessions
   */
  cleanup(): Promise<number>;

  /**
   * Get all active sessions count
   */
  getActiveSessionsCount(): Promise<number>;
}
