import { ReactNode } from 'react';

import { User } from 'firebase/auth';

export interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  hasGoogleProvider: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
