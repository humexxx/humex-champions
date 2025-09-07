/**
 * Portfolio module constants
 */

// Asset search configuration
export const ASSET_SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 10,
  DEBOUNCE_MS: 300,
} as const;

// Portfolio limits and constraints
export const PORTFOLIO_LIMITS = {
  MAX_PORTFOLIOS_PER_USER: 10,
  MAX_ASSETS_PER_PORTFOLIO: 100,
  MIN_TRANSACTION_AMOUNT: 0.01,
  MAX_TRANSACTION_AMOUNT: 1000000,
} as const;

// Default form values
export const DEFAULT_FORM_VALUES = {
  TRANSACTION: {
    type: 'BUY',
    quantity: 0,
    price: 0,
    notes: '',
  },
} as const;
