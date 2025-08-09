/**
 * Environment Configuration Validator
 *
 * This module validates that all required environment variables are present
 * and provides helpful error messages if they're missing.
 */

import { ENV } from '../consts';

interface ValidationRule {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    required: !ENV.USE_MOCKED_DATA, // Only required if not using mocked data
    description: 'Firebase Project ID',
    validator: (value) => value.length > 0,
  },
  {
    key: 'VITE_FIREBASE_API_KEY',
    required: !ENV.USE_MOCKED_DATA,
    description: 'Firebase API Key',
    validator: (value) => value.length > 0,
  },
  {
    key: 'VITE_APP_VERSION',
    required: false,
    description: 'Application Version',
  },
];

interface ValidationError {
  key: string;
  message: string;
}

/**
 * Validates environment configuration
 * @returns Array of validation errors (empty if all valid)
 */
export function validateEnvironment(): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of VALIDATION_RULES) {
    const value = import.meta.env[rule.key];

    // Check if required variable is missing
    if (rule.required && (!value || value.trim() === '')) {
      errors.push({
        key: rule.key,
        message: `Required environment variable ${rule.key} (${rule.description}) is missing or empty`,
      });
      continue;
    }

    // Run custom validator if provided
    if (value && rule.validator && !rule.validator(value)) {
      errors.push({
        key: rule.key,
        message: `Environment variable ${rule.key} (${rule.description}) has invalid format`,
      });
    }
  }

  return errors;
}

/**
 * Validates environment and throws if there are critical errors
 */
export function validateEnvironmentOrThrow(): void {
  const errors = validateEnvironment();

  if (errors.length > 0) {
    const errorMessage = [
      '🚨 Environment Configuration Errors:',
      '',
      ...errors.map((error) => `  ❌ ${error.message}`),
      '',
      '💡 Check your .env.local file and ensure all required variables are set.',
      '📖 See .env.example for reference.',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Logs environment configuration info (safe for production)
 */
export function logEnvironmentInfo(): void {
  if (ENV.NODE_ENV === 'development') {
    console.group('🔧 Environment Configuration');
    console.log('📦 Version:', ENV.APP_VERSION);
    console.log('🌍 Environment:', ENV.NODE_ENV);
    console.log(
      '🎭 Mocked Data:',
      ENV.USE_MOCKED_DATA ? '✅ Enabled' : '❌ Disabled'
    );
    console.log(
      '👑 Admin Mode:',
      ENV.USE_ADMIN_ROLE ? '✅ Enabled' : '❌ Disabled'
    );
    console.log(
      '👤 Mock User:',
      ENV.USE_MOCKED_USER ? '✅ Enabled' : '❌ Disabled'
    );
    console.groupEnd();
  }
}
