import './fixPaths';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (process.env.FUNCTIONS_EMULATOR === 'true') {
  // Running in emulator - use local Firestore
  admin.initializeApp({
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
  admin.initializeApp();
}

export * from './adminFunctions';
export * from './userFunctions';

export * from './finances';
export * from './uplift';
