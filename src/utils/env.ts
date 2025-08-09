/**
 * Environment Variables Utilities
 *
 * Helper functions for safely parsing and handling environment variables
 * with proper type safety and default values.
 *
 * @example
 * ```typescript
 * import { getEnvBoolean, getEnvString } from 'src/utils/env';
 *
 * const useDevMode = getEnvBoolean('VITE_DEV_MODE', false);
 * const apiUrl = getEnvString('VITE_API_URL', 'http://localhost:3000');
 * ```
 */

/**
 * Safely parse a boolean environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if variable is undefined
 * @returns Parsed boolean value
 */
export const getEnvBoolean = (
  key: string,
  defaultValue: boolean = false
): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Safely get a string environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if variable is undefined
 * @returns String value or default
 */
export const getEnvString = (
  key: string,
  defaultValue: string = ''
): string => {
  return import.meta.env[key] ?? defaultValue;
};

/**
 * Safely parse a number environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if variable is undefined or invalid
 * @returns Parsed number value
 */
export const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get environment variable as an array (comma-separated values)
 * @param key - Environment variable key
 * @param defaultValue - Default array if variable is undefined
 * @returns Array of string values
 *
 * @example
 * ```typescript
 * // VITE_ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com
 * const origins = getEnvArray('VITE_ALLOWED_ORIGINS', ['http://localhost:3000']);
 * // Result: ['http://localhost:3000', 'https://myapp.com']
 * ```
 */
export const getEnvArray = (
  key: string,
  defaultValue: string[] = []
): string[] => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;

  return value
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);
};
