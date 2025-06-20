// server/src/infrastructure/config/database.ts

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  ssl?: boolean;
}

/**
 * Get database configuration from environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'guesense_dashboard',
    synchronize: false, // always false, no need need to sync schema even in development
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true',
  };
}
