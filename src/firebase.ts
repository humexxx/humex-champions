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

// Connect to emulators in development
if (import.meta.env.DEV) {
  // Flag to prevent multiple connections
  let connectorsInitialized = false;

  if (!connectorsInitialized) {
    try {
      // Connect to the Functions emulator (doesn't require Java)
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Connected to Firebase Functions emulator');

      // Uncomment these when Java is installed:
      // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      // connectFirestoreEmulator(firestore, 'localhost', 8080);

      connectorsInitialized = true;
    } catch (error) {
      console.warn('Firebase emulators connection failed:', error);
    }
  }
}

export default app;
