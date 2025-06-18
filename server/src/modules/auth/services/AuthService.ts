// server/src/modules/auth/services/auth.service.ts

import { LoginRequest, LoginResponse, ValidateSessionResponse } from '@guesense-dash/shared';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { HttpClientFactory, HttpClientPort } from '../../../infrastructure';
import { DI_TYPES } from '../../../shared';
import { IAuthService } from '../interfaces/IAuthService';
import { ISessionStore, SessionData } from '../interfaces/ISessionStore';

/**
 * Authentication Service Implementation
 * Handles Service GOA login proxy and session management
 */
@injectable()
export class AuthService implements IAuthService {
  private httpClient: HttpClientPort;
  private jwtSecret: string;
  private sessionExpiry: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(@inject(DI_TYPES.ISessionStore) private sessionStore: ISessionStore) {
    this.httpClient = HttpClientFactory.createGOAServiceClient();
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    this.jwtSecret = process.env.JWT_SECRET;
  }

  /**
   * Proxy login request to Service GOA
   */
  async loginProxy(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Call Service GOA login endpoint
      const loginUrl = process.env.LOGIN_URL || '/api/v1/loginbackoffice';
      const serviceResponse = await this.httpClient.post(loginUrl, {
        email: credentials.email,
        password: credentials.password,
      });

      // Validate Service GOA response
      if (!serviceResponse.data || serviceResponse.data.status_code !== 2000) {
        throw new Error('Login failed: Invalid credentials');
      }

      // Map Service GOA response to our format
      const mappedResponse = this.mapServiceResponse(serviceResponse.data);

      // Generate our session token
      const sessionToken = this.generateSessionToken(mappedResponse.user.id);

      // Prepare session data
      const sessionData: SessionData = {
        userId: mappedResponse.user.id,
        username: mappedResponse.user.username,
        email: mappedResponse.user.email,
        name: mappedResponse.user.name,
        user_role: mappedResponse.user.user_role,
        user_type: mappedResponse.user.user_type,
        is_permanent_delete: mappedResponse.user.is_permanent_delete,
        serviceBToken: serviceResponse.data.data.bearer.token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.sessionExpiry),
        lastActivity: new Date(),
      };

      // Store session
      await this.sessionStore.set(sessionToken, sessionData);

      // Return login response with our session token
      return {
        user: mappedResponse.user,
        token: sessionToken,
        expiresAt: sessionData.expiresAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      throw new Error('Authentication failed: Unknown error');
    }
  }

  /**
   * Validate current session token
   */
  async validateSession(sessionToken: string): Promise<ValidateSessionResponse> {
    try {
      // Verify JWT token and extract userId
      const decoded = jwt.verify(sessionToken, this.jwtSecret) as { userId: string };

      const sessionData = await this.sessionStore.get(sessionToken);

      if (!sessionData) {
        return { isValid: false };
      }

      // Validate userId matches session data
      if (sessionData.userId !== decoded.userId) {
        await this.sessionStore.delete(sessionToken);
        return { isValid: false };
      }

      if (sessionData.expiresAt < new Date()) {
        await this.sessionStore.delete(sessionToken);
        return { isValid: false };
      }

      if (sessionData.is_permanent_delete === 1) {
        await this.sessionStore.delete(sessionToken);
        return { isValid: false };
      }

      // Update last activity
      await this.sessionStore.updateActivity(sessionToken);

      return {
        isValid: true,
        user: {
          id: sessionData.userId,
          username: sessionData.username,
          email: sessionData.email,
          name: sessionData.name,
          user_role: sessionData.user_role,
          user_type: sessionData.user_type,
          is_permanent_delete: sessionData.is_permanent_delete,
        },
        expiresAt: sessionData.expiresAt.toISOString(),
      };
    } catch (error) {
      // JWT verification failed or other error
      return { isValid: false };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(sessionToken: string): Promise<void> {
    try {
      // Verify token first
      jwt.verify(sessionToken, this.jwtSecret);

      // Remove session from store
      await this.sessionStore.delete(sessionToken);
    } catch (error) {
      // Token invalid or session not found - still consider logout successful
      // No need to throw error for logout
    }
  }

  /**
   * Generate JWT session token
   */
  private generateSessionToken(userId: string): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.sessionExpiry) / 1000),
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  /**
   * Map Service GOA response to our format
   */
  private mapServiceResponse(serviceResponse: any): { user: any } {
    const user = serviceResponse.data.user;

    return {
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        name: user.fullname,
        user_role: user.user_role,
        user_type: user.user_type,
        is_permanent_delete: user.is_permanent_delete,
      },
    };
  }
}
