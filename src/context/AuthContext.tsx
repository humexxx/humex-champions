import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import { EProviderType } from '@shared/enums';
import { IdTokenResult, User, onAuthStateChanged } from 'firebase/auth';
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

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ENV.USE_MOCKED_USER) {
      setCurrentUser(MOCKED_USER);
      setIsAdmin(ENV.USE_ADMIN_ROLE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdTokenResult();
        setToken(token);
        setIsAdmin(Boolean(token.claims.admin) || ENV.USE_ADMIN_ROLE);
      }

      // Get claims
      // user
      //   ?.getIdTokenResult()
      //   .then(console.warn)
      //   .catch((error) => {
      //     console.error(error);
      //   });
      setLoading(false);
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
