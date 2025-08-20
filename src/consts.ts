import packageJson from '../package.json';
import { getEnvBoolean, getEnvString } from './utils/env';

// Environment Enum
export enum ENVIRONMENTS {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// Environment Configuration
export const ENV = {
  USE_MOCKED_DATA: getEnvBoolean('VITE_USE_MOCKED_DATA'),
  USE_ADMIN_ROLE: getEnvBoolean('VITE_USE_MOCKED_ADMIN_MODE'),
  USE_MOCKED_USER: getEnvBoolean('VITE_USE_MOCK_USER'),
  APP_VERSION: getEnvString('VITE_APP_VERSION', packageJson.version),
  NODE_ENV: getEnvString('VITE_NODE_ENV', ENVIRONMENTS.DEVELOPMENT),
  CURRENT_ENV: getEnvString(
    'VITE_NODE_ENV',
    ENVIRONMENTS.DEVELOPMENT
  ) as ENVIRONMENTS,
} as const;

// Legacy exports for backward compatibility (consider deprecating)
export const SYSTEM = 'SYSTEM';

export const MULTIPLE_GRAPH_COLORS = [
  '#4e79a7',
  '#f28e2c',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
];

export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
};

export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    FORGOT_PASSWORD: '/forgot-password',
  },
  PORTAL: {
    INDEX: '/portal',
    DASHBOARD: '/portal/dashboard',
    SETTINGS: '/portal/settings',
    FINANCES: {
      INDEX: '/portal/finances',
      PERSONAL_FINANCES: '/portal/finances/personal-finances',
      TRADING_JOURNAL: '/portal/finances/trading-journal',
      PORTFOLIO: '/portal/finances/portfolio',
      COMPOUND_CALCULATOR: '/portal/finances/compound-calculator',
    },
    HEALTH: {
      INDEX: '/portal/health',
      CALCULATOR: '/portal/health/calculator',
      NUTRITION: '/portal/health/nutrition',
      TRAINING_PROGRAM: '/portal/health/training-program',
    },
    UPLIFT: {
      INDEX: '/portal/uplift',
      PATHWAY: '/portal/uplift/pathway',
      PLANNER: '/portal/uplift/planner',
    },
    ENTERTAINMENT: {
      INDEX: '/portal/entertainment',
      YOUTUBE: '/portal/entertainment/youtube',
      TRIPS: '/portal/entertainment/trips',
      F1: '/portal/entertainment/f1',
    },
    SOCIAL: {
      INDEX: '/portal/social',
      MEMBERS: '/portal/social/members',
      GROUPS: '/portal/social/groups',
    },
    ADMIN: {
      INDEX: '/portal/admin',
    },
  },
};
