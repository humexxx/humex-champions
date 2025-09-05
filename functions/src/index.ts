import { initializeFirebase } from './core/firebase';
import './fixPaths';

// Initialize Firebase Admin
initializeFirebase();

// New modular exports
export * from './modules/admin';
export * from './modules/auth';
export * from './modules/dashboard';
export * from './modules/entertainment';
export * from './modules/finances';
export * from './modules/uplift';
