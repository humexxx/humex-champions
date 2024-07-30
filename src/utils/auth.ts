import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';

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
