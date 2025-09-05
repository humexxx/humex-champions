import { initializeFirebase } from './core/firebase';
import './fixPaths';

// Initialize Firebase Admin
initializeFirebase();

// New modular exports
export * as admin from './modules/admin';
export * as auth from './modules/auth';
export * as dashboard from './modules/dashboard';
export * as entertainment from './modules/entertainment';
export * as finances from './modules/finances';
export * as uplift from './modules/uplift';
