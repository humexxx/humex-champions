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

// Route types for better type safety
export type RouteKeys = typeof ROUTES;

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
      ANALYTICS: '/portal/uplift/analytics',
    },
    ENTERTAINMENT: {
      INDEX: '/portal/entertainment',
      YOUTUBE: '/portal/entertainment/youtube',
      TRIPS: '/portal/entertainment/trips',
      F1: '/portal/entertainment/f1',
      SOCCER: '/portal/entertainment/soccer',
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
} as const;

// Route metadata for navigation and SEO
export const ROUTE_METADATA = {
  [ROUTES.PORTAL.DASHBOARD]: {
    title: 'Dashboard',
    icon: 'Dashboard',
    description: 'Overview of your HumEx Champions progress',
    category: 'core',
  },
  [ROUTES.PORTAL.FINANCES.INDEX]: {
    title: 'Finances',
    icon: 'AccountBalance',
    description: 'Manage your financial portfolio and investments',
    category: 'finances',
  },
  [ROUTES.PORTAL.FINANCES.PERSONAL_FINANCES]: {
    title: 'Personal Finances',
    icon: 'MonetizationOn',
    description: 'Track your personal income and expenses',
    category: 'finances',
  },
  [ROUTES.PORTAL.FINANCES.PORTFOLIO]: {
    title: 'Portfolio',
    icon: 'TrendingUp',
    description: 'Investment portfolio management and tracking',
    category: 'finances',
  },
  [ROUTES.PORTAL.FINANCES.TRADING_JOURNAL]: {
    title: 'Trading Journal',
    icon: 'Assessment',
    description: 'Record and analyze your trading activities',
    category: 'finances',
  },
  [ROUTES.PORTAL.HEALTH.INDEX]: {
    title: 'Health',
    icon: 'LocalHospital',
    description: 'Track your health and wellness journey',
    category: 'health',
  },
  [ROUTES.PORTAL.UPLIFT.INDEX]: {
    title: 'Uplift',
    icon: 'TrendingUp',
    description: 'Personal development and goal tracking',
    category: 'uplift',
  },
  [ROUTES.PORTAL.ENTERTAINMENT.INDEX]: {
    title: 'Entertainment',
    icon: 'Sports',
    description: 'Sports, trips and entertainment tracking',
    category: 'entertainment',
  },
} as const;
