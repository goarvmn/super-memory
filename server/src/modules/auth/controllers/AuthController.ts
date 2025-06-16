// server/src/modules/auth/controllers/AuthController.ts

import {
  AuthErrorCode,
  BaseApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  ValidateSessionResponse,
} from '@guesense-dash/shared';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../shared/types/container';
import { IAuthService } from '../interfaces';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
/**
 * Authentication Controller
 * Handles authentication REST endpoints
 */
@injectable()
export class AuthController {
  constructor(@inject(DI_TYPES.IAuthService) private authService: IAuthService) {}

  /**
   * POST /api/auth/login
   * Authenticate user with GOA Service
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as LoginRequest;

      // validate request
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: AuthErrorCode.VALIDATION_ERROR,
            message: 'Email and password are required',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      // authenticate with GOA Service
      const loginResponse = await this.authService.loginProxy({ email, password });

      res.status(200).json({
        success: true,
        data: loginResponse,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<LoginResponse>);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';

      res.status(401).json({
        success: false,
        error: {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * POST /api/auth/logout
   * Clear user session
   */
  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessionToken = req.sessionToken;

      if (!sessionToken) {
        res.status(400).json({
          success: false,
          error: {
            code: AuthErrorCode.TOKEN_MISSING,
            message: 'Session token is required',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      // Clear session
      await this.authService.logout(sessionToken);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ message: string }>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: AuthErrorCode.VALIDATION_ERROR,
          message: 'Error during logout process',
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * GET /api/auth/validate
   * Validate current session
   */
  validate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessionToken = req.sessionToken;
      console.log('VALIDATE', sessionToken);

      if (!sessionToken) {
        res.status(400).json({
          success: false,
          error: {
            code: AuthErrorCode.TOKEN_MISSING,
            message: 'Session token is required',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      // validate session with explicit validation endpoint
      const validationResult = await this.authService.validateSession(sessionToken);
      console.log('VALIDATION RESULT', validationResult);

      if (!validationResult.isValid) {
        res.status(401).json({
          success: false,
          error: {
            code: AuthErrorCode.SESSION_EXPIRED,
            message: 'Session is invalid or expired',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      res.status(200).json({
        success: true,
        data: validationResult,
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<ValidateSessionResponse>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: AuthErrorCode.VALIDATION_ERROR,
          message: 'Error validating session',
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: AuthErrorCode.TOKEN_INVALID,
            message: 'User not authenticated',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      res.status(200).json({
        success: true,
        data: { user: req.user },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<{ user: User }>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: AuthErrorCode.VALIDATION_ERROR,
          message: 'Error retrieving user information',
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };
}
