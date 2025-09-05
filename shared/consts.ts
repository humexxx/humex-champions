/**
 * DEPRECATED: This file is kept for backwards compatibility.
 * Use individual files in ./consts/ directory instead:
 * - ./consts/firestorePaths.ts for Firestore paths
 * - ./consts/callableFunctions.ts for callable function names
 * - ./consts/portfolio.ts for portfolio constants
 */

// Re-export from the new modular structure
export * from './consts';

// Explicit re-exports for backwards compatibility
export {
  CALLABLE_FUNCTION_NAMES,
  CALLABLE_FUNCTIONS,
} from './consts/callableFunctions';
export { FIRESTORE_PATHS } from './consts/firestorePaths';
export { PORTFOLIO_CONSTANTS } from './consts/portfolio';
