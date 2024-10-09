import { User } from 'firebase/auth';
import { ReactNode } from 'react';

export interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
