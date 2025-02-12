import packageJson from '../package.json';
export const VERSION = import.meta.env.VITE_APP_VERSION || packageJson.version;

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
      INDEX: '/portal/entretainment',
      YOUTUBE: '/portal/entretainment/youtube',
      TRIPS: '/portal/entretainment/trips',
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
