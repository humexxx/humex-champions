import { User } from 'firebase/auth';
import { ReactNode } from 'react';

export interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  hasGoogleProvider: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
