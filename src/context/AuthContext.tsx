import { createContext, useEffect, useState } from 'react';

import { EProviderType } from '@shared/enums';
import { IdTokenResult, User, onAuthStateChanged } from 'firebase/auth';
import { GlobalLoader } from 'src/components';
import { auth } from 'src/firebase';

export interface AuthContextType {
  currentUser: User | null;
  token: IdTokenResult | null;
  isAdmin: boolean;
  hasGoogleProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdTokenResult();
        setToken(token);
        setIsAdmin(Boolean(token.claims.admin));
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
