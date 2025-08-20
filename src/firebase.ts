// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators only when explicitly enabled
const useEmulators = import.meta.env.VITE_USE_EMULATORS;

if (useEmulators && import.meta.env.DEV) {
  console.log(`🔧 Emulator mode enabled: ${useEmulators}`);

  // Connect to Functions emulator (always available when emulators are requested)
  if (useEmulators === 'true' || useEmulators === 'functions') {
    try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log(
        '🔧 Connected to Firebase Functions emulator at localhost:5001'
      );
    } catch (error) {
      console.warn('Firebase Functions emulator connection failed:', error);
    }
  }

  // Connect to full emulator suite (only when running dev:full)
  if (useEmulators === 'true') {
    console.log('🔧 Full emulator suite requested');
    // Uncomment these when Java is installed and you want full emulator suite:
    /*
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('🔧 Connected to Firebase Auth emulator');
    } catch (error) {
      console.warn('Firebase Auth emulator connection failed:', error);
    }

    try {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      console.log('🔧 Connected to Firebase Firestore emulator');
    } catch (error) {
      console.warn('Firebase Firestore emulator connection failed:', error);
    }
    */
  }
} else if (import.meta.env.DEV) {
  console.log('🌐 Using production Firebase services (no emulators)');
}

export default app;
