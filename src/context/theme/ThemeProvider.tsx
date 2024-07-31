import { useMemo, useState } from 'react';
import ThemeContext from './ThemeContext';
import { ThemeContextType, ThemeProviderProps } from './ThemeContext.types';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useAuth } from '../auth';
import { getDesignTokens } from './themes';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const { currentUser } = useAuth();

  const theme = useMemo(
    () =>
      createTheme(
        (currentUser as any)
          .hasCustomTheme /* || true when we want to add a custom theme */
          ? getDesignTokens(mode)
          : {
              palette: {
                mode,
              },
            }
      ),
    [currentUser, mode]
  );

  const value: ThemeContextType = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
