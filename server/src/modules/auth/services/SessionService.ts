// server/src/modules/auth/services/SessionService.ts

import { injectable } from 'inversify';
import { ISessionStore, SessionData } from '../interfaces';

/**
 * In-Memory Session Storage Implementation
 */
@injectable()
export class SessionService implements ISessionStore {
  private sessions: Map<string, SessionData> = new Map();

  /**
   * Store session data
   */
  async set(sessionToken: string, sessionData: SessionData): Promise<void> {
    this.sessions.set(sessionToken, { ...sessionData });
  }

  /**
   * Retrieve session data by token
   */
  async get(sessionToken: string): Promise<SessionData | null> {
    const sessionData = this.sessions.get(sessionToken);

    if (!sessionData) {
      return null;
    }

    // Check if session is expired
    if (sessionData.expiresAt < new Date()) {
      // Auto-remove expired session
      this.sessions.delete(sessionToken);
      return null;
    }

    // Return a copy to prevent external modifications
    return { ...sessionData };
  }

  /**
   * Check if session exists and is valid
   */
  async exists(sessionToken: string): Promise<boolean> {
    const sessionData = this.sessions.get(sessionToken);

    if (!sessionData) {
      return false;
    }

    // Check expiry
    if (sessionData.expiresAt < new Date()) {
      this.sessions.delete(sessionToken);
      return false;
    }

    return true;
  }

  /**
   * Remove session from store
   */
  async delete(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }

  /**
   * Update last activity timestamp
   */
  async updateActivity(sessionToken: string): Promise<void> {
    const sessionData = this.sessions.get(sessionToken);

    if (sessionData) {
      sessionData.lastActivity = new Date();
      this.sessions.set(sessionToken, sessionData);
    }
  }

  /**
   * Manual cleanup of expired sessions
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [token, sessionData] of this.sessions.entries()) {
      if (sessionData.expiresAt < now) {
        this.sessions.delete(token);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get all active sessions count (basic stats for MVP)
   */
  async getActiveSessionsCount(): Promise<number> {
    await this.cleanup();
    return this.sessions.size;
  }
}
