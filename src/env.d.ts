/// <reference types="vite/client" />

/**
 * Environment Variables Type Definitions
 *
 * This file provides type safety for environment variables used in the application.
 * All environment variables should be prefixed with VITE_ to be accessible in the client.
 */

interface ImportMetaEnv {
  // Application Configuration
  readonly VITE_APP_VERSION?: string;
  readonly VITE_NODE_ENV?: 'development' | 'production' | 'test';

  // Feature Flags
  readonly VITE_USE_MOCKED_DATA?: 'true' | 'false';
  readonly VITE_USE_MOCKED_ADMIN_MODE?: 'true' | 'false';
  readonly VITE_USE_MOCK_USER?: 'true' | 'false';

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  // API Configuration
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;

  // Development Tools
  readonly VITE_ENABLE_DEVTOOLS?: 'true' | 'false';
  readonly VITE_SHOW_DEBUG_INFO?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
