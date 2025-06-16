// server/src/modules/auth/middleware/AuthMiddleware.ts

import { AuthErrorCode, BaseApiResponse } from '@guesense-dash/shared';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../shared/types/container';
import { IAuthService } from '../interfaces';
import { UserRole, UserType } from '../types/AuthTypes';

/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    user_role: number;
    user_type: number;
    is_permanent_delete: number;
  };
  sessionToken?: string;
}

/**
 * Authentication Middleware
 * Validates session tokens and protects routes
 */
@injectable()
export class AuthMiddleware {
  constructor(@inject(DI_TYPES.IAuthService) private authService: IAuthService) {}

  /**
   * Middleware function to authenticate requests
   */
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: {
            code: AuthErrorCode.TOKEN_MISSING,
            message: 'Authorization token is required',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      const sessionToken = authHeader.substring(7);

      const validationResult = await this.authService.validateSession(sessionToken);

      if (!validationResult.isValid || !validationResult.user) {
        res.status(401).json({
          success: false,
          error: {
            code: AuthErrorCode.TOKEN_INVALID,
            message: 'Invalid or expired session token',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      req.user = validationResult.user;
      req.sessionToken = sessionToken;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: AuthErrorCode.VALIDATION_ERROR,
          message: 'Error validating authentication',
        },
        timestamp: new Date().toISOString(),
      } as BaseApiResponse<never>);
    }
  };

  /**
   * Role-based access control middleware (not used at the moment)
   */
  requireRole = (allowedRoles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

      if (!allowedRoles.includes(req.user.user_role)) {
        res.status(403).json({
          success: false,
          error: {
            code: AuthErrorCode.INSUFFICIENT_ROLE,
            message: 'Insufficient role permissions',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      next();
    };
  };

  /**
   * User type access control middleware (not used at the moment)
   */
  requireUserType = (allowedTypes: UserType[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

      if (!allowedTypes.includes(req.user.user_type)) {
        res.status(403).json({
          success: false,
          error: {
            code: AuthErrorCode.INSUFFICIENT_TYPE,
            message: 'Insufficient user type permissions',
          },
          timestamp: new Date().toISOString(),
        } as BaseApiResponse<never>);
        return;
      }

      next();
    };
  };
}
