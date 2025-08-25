import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { EProviderType } from '@shared/enums';
import { IdTokenResult, onAuthStateChanged, User } from 'firebase/auth';
import { GlobalLoader } from 'src/components';
import { ENV } from 'src/consts';
import { auth } from 'src/firebase';
import { MOCKED_USER } from 'src/mock/authMockData';

export interface AuthContextType {
  currentUser: User | null;
  token: IdTokenResult | null;
  isAdmin: boolean;
  hasGoogleProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

// SessionStorage keys for dev persistence
const STORAGE_KEYS = {
  CURRENT_USER: '__dev_auth_currentUser',
  IS_ADMIN: '__dev_auth_isAdmin',
  HAS_INITIALIZED: '__dev_auth_hasInitialized',
} as const;

// Helper functions for sessionStorage persistence in dev
const saveAuthStateToStorage = (user: User | null, isAdmin: boolean) => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
      sessionStorage.setItem(STORAGE_KEYS.HAS_INITIALIZED, 'true');
    } catch (error) {
      console.warn('Failed to save auth state to sessionStorage:', error);
    }
  }
};

const loadAuthStateFromStorage = () => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    try {
      const userStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const isAdminStr = sessionStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      const hasInitialized =
        sessionStorage.getItem(STORAGE_KEYS.HAS_INITIALIZED) === 'true';

      if (hasInitialized && userStr && isAdminStr) {
        return {
          currentUser: JSON.parse(userStr),
          isAdmin: JSON.parse(isAdminStr),
          hasInitialized: true,
        };
      }
    } catch (error) {
      console.warn('Failed to load auth state from sessionStorage:', error);
    }
  }
  return null;
};

export function AuthProvider({ children }: PropsWithChildren) {
  // Try to load saved state from sessionStorage in dev - but only on initial load
  const savedState = useMemo(() => {
    if (import.meta.env.DEV) {
      return loadAuthStateFromStorage();
    }
    return null;
  }, []); // Empty dependency array - only run once

  const [currentUser, setCurrentUser] = useState<User | null>(
    savedState?.currentUser || null
  );
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [isAdmin, setIsAdmin] = useState(savedState?.isAdmin || false);
  const [loading, setLoading] = useState(!savedState?.hasInitialized);

  useEffect(() => {
    if (ENV.USE_MOCKED_USER) {
      const mockedUser = MOCKED_USER;
      const mockedIsAdmin = ENV.USE_ADMIN_ROLE;

      setCurrentUser(mockedUser);
      setIsAdmin(mockedIsAdmin);
      setLoading(false);

      // Save to sessionStorage for dev hot reload
      if (import.meta.env.DEV) {
        saveAuthStateToStorage(mockedUser, mockedIsAdmin);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const newToken = user ? await user.getIdTokenResult() : null;
      const newIsAdmin = newToken
        ? Boolean(newToken.claims.admin) || ENV.USE_ADMIN_ROLE
        : false;

      // Update component state
      setCurrentUser(user);
      setToken(newToken);
      setIsAdmin(newIsAdmin);
      setLoading(false);

      // Save to sessionStorage for dev hot reload - but throttle it
      if (import.meta.env.DEV) {
        // Use a timeout to avoid excessive saves during rapid state changes
        setTimeout(() => {
          saveAuthStateToStorage(user, newIsAdmin);
        }, 100);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    token,
    hasGoogleProvider:
      currentUser?.providerData.some(
        (x) => x.providerId === EProviderType.GOOGLE
      ) ?? false,
  };

  return (
    <AuthContext.Provider value={value}>
      {Boolean(loading) && <GlobalLoader />}
      {!loading && children}
    </AuthContext.Provider>
  );
}
