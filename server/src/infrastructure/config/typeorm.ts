// server/src/infrastructure/config/typeorm.ts

import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// load environment variables
config({ path: '.env.local' });

/**
 * TypeORM configuration
 */
export function getTypeORMConfig(): DataSourceOptions {
  const entityPaths = ['src/modules/**/entities/*.entity.{ts,js}'];
  const migrationPaths = ['src/infrastructure/database/migrations/*{.ts,.js}'];
  const subscriberPaths = ['src/subscribers/*{.ts,.js}'];

  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'guesense_dashboard',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: entityPaths,
    migrations: migrationPaths,
    subscribers: subscriberPaths,
    ssl: false,
    cache: {
      type: 'database',
      tableName: 'query_result_cache',
    },
  };
}

// Create DataSource for CLI usage
const AppDataSource = new DataSource(getTypeORMConfig());

export default AppDataSource;
