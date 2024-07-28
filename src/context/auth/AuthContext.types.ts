import { User } from 'firebase/auth';
import { ReactNode } from 'react';

export interface AuthContextType {
  currentUser: User | null;
}

export interface AuthProviderProps {
  children: ReactNode;
}
