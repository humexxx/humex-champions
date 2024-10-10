import { FirebaseError } from 'firebase/app';
import {
  AuthErrorCodes,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';

export function handleAuthError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        throw new Error('Email already exists');
      case AuthErrorCodes.INVALID_EMAIL:
        throw new Error('Invalid email');
      case AuthErrorCodes.WEAK_PASSWORD:
        throw new Error('Weak password');
      default:
        throw new Error('An error occurred');
    }
  }
  throw error;
}

export async function loginWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();

  const auth = getAuth();
  auth.useDeviceLanguage();
  // signInWithRedirect(auth, provider);
  return await signInWithPopup(auth, provider);
}
