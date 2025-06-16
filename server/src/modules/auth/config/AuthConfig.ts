// server/src/modules/auth/config/AuthConfig.ts

import { AuthOptions, UserRole, UserType } from '../types/AuthTypes';

/**
 * Authentication Configuration
 */
export class AuthConfig {
  /**
   * Default authentication options
   */
  static getDefaultOptions(): AuthOptions {
    return {
      sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      jwtSecret: process.env.JWT_SECRET || 'default-secret-please-change-in-production',
    };
  }

  /**
   * GOA Service configuration
   */
  static getGOAServiceConfig() {
    return {
      baseURL: process.env.GOA_SERVICE_URL || 'https://service-b.example.com',
      loginEndpoint: process.env.LOGIN_URL || '/api/v1/loginbackoffice',
      timeout: 15000,
    };
  }

  /**
   * Basic role information for display purposes
   */
  static getRoleInfo() {
    return {
      [UserRole.SUPER_ADMIN]: { name: 'Super Administrator', description: 'Full system access' },
      [UserRole.ADMIN]: { name: 'Administrator', description: 'Full system access' },
      [UserRole.TECHNICAL_SUPPORT]: { name: 'Technical Support', description: 'Product mapping tasks' },
    };
  }

  /**
   * Basic user type information
   */
  static getUserTypeInfo() {
    return {
      [UserType.INTERNAL]: { name: 'Internal User', description: 'Company employees' },
    };
  }

  /**
   * Allowed user roles
   */
  static getAllowedUserRoles(): UserRole[] {
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TECHNICAL_SUPPORT];
  }

  /**
   * Allowed user types for system access
   */
  static getAllowedUserTypes(): UserType[] {
    return [UserType.INTERNAL];
  }
}
