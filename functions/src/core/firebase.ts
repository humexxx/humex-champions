import { App, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

export function adminApp(): App {
  if (!app) {
    app = getApps()[0] ?? initializeApp();
  }
  return app;
}

export const db = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());

// Initialize based on environment
export function initializeFirebase(): void {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    // Running in emulator - use local Firestore
    initializeApp({
      projectId: 'humex-champions',
    });

    // Point to Firestore emulator (when available)
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log('🔧 Admin SDK connecting to Firestore emulator');
    } else {
      console.log(
        '⚠️ Functions emulator running but Firestore emulator not available'
      );
    }
  } else {
    // Production - use default initialization
    initializeApp();
  }
}
