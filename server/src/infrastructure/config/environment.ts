// server/src/infrastructure/config/environment.ts

/**
 * Environment Configuration Validation
 */

export interface EnvironmentConfig {
  // application
  NODE_ENV: string;
  PORT: number;

  // external services
  GOA_SERVICE_URL: string;
  LOGIN_URL: string;

  GS_SERVICE_URL: string;

  // security
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string[];
}

/**
 * Validate and parse environment variables
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];

  // required environment variables
  const requiredVars = ['GOA_SERVICE_URL', 'LOGIN_URL', 'GS_SERVICE_URL', 'JWT_SECRET'];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // JWT Secret validation
  //   if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  //     errors.push('JWT_SECRET must be at least 32 characters long');
  //   }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Environment validation failed');
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    GOA_SERVICE_URL: process.env.GOA_SERVICE_URL!,
    LOGIN_URL: process.env.LOGIN_URL!,
    GS_SERVICE_URL: process.env.GS_SERVICE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  };
}

/**
 * Get validated environment config (singleton)
 */
let envConfig: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!envConfig) {
    envConfig = validateEnvironment();
  }
  return envConfig;
}
