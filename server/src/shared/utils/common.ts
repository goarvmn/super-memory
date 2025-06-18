// server/src/shared/utils/common.ts

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Get current directory path (ESM compatible)
 * Replacement for __dirname in ESM modules
 */
export function getCurrentDir(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
  const currentDir = getCurrentDir(import.meta.url);
  return require('path').resolve(currentDir, '..', '..', '..', '..');
}

/**
 * Get server source directory
 */
export function getServerSrcDir(): string {
  const currentDir = getCurrentDir(import.meta.url);
  return join(currentDir, '../../');
}

/**
 * Build TypeORM entity paths (ESM compatible)
 */
export function getEntityPaths(): string[] {
  const srcDir = getServerSrcDir();
  return [join(srcDir, 'modules/**/entities/*.entity.{ts,js}')];
}

/**
 * Build TypeORM migration paths (ESM compatible)
 */
export function getMigrationPaths(): string[] {
  const srcDir = getServerSrcDir();
  return [join(srcDir, 'migrations/*{.ts,.js}')];
}

/**
 * Build TypeORM subscriber paths (ESM compatible)
 */
export function getSubscriberPaths(): string[] {
  const srcDir = getServerSrcDir();
  return [join(srcDir, 'subscribers/*{.ts,.js}')];
}
