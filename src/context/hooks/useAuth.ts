import { useContext, useMemo } from 'react';

import AuthContext, { AuthContextType } from '../AuthContext';

export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  // Create fallback context using useMemo to prevent infinite re-renders
  const fallbackContext = useMemo((): AuthContextType | null => {
    // Only create fallback if context is missing and we're in dev
    if (context || !import.meta.env.DEV || typeof window === 'undefined') {
      return null;
    }

    try {
      const userStr = sessionStorage.getItem('__dev_auth_currentUser');
      const isAdminStr = sessionStorage.getItem('__dev_auth_isAdmin');
      const hasInitialized =
        sessionStorage.getItem('__dev_auth_hasInitialized') === 'true';

      if (hasInitialized && userStr && isAdminStr) {
        const currentUser = JSON.parse(userStr);
        const isAdmin = JSON.parse(isAdminStr);

        console.warn(
          'useAuth: Creating temporary fallback context from sessionStorage'
        );

        return {
          currentUser,
          isAdmin,
          token: null,
          hasGoogleProvider:
            currentUser?.providerData?.some(
              (x: any) => x.providerId === 'google.com'
            ) ?? false,
        };
      }
    } catch (error) {
      console.warn('Failed to create fallback auth context:', error);
    }

    return null;
  }, [context]); // Depend on context so it updates when context becomes available

  // ALWAYS prefer the real context if it exists
  if (context) {
    return context;
  }

  // Use fallback as last resort in development
  if (import.meta.env.DEV && fallbackContext) {
    console.warn(
      'useAuth: Using temporary fallback context - real context should restore soon'
    );
    return fallbackContext;
  }

  if (import.meta.env.DEV) {
    console.warn('useAuth: No context available and no fallback possible');
  }

  throw new Error('useAuth must be used within an AuthProvider');
}
