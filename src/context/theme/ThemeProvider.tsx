import { useMemo } from 'react';

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { LOCAL_STORAGE_KEYS } from 'src/consts';
import { useAuth } from 'src/context/hooks';
import { EThemeType } from 'src/enums';
import { useLocalStorage } from 'src/hooks';

import ThemeContext from './ThemeContext';
import { ThemeContextType, ThemeProviderProps } from './ThemeContext.types';
import { getDesignTokens } from './themes';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useLocalStorage<EThemeType>(
    LOCAL_STORAGE_KEYS.THEME,
    EThemeType.Light
  );
  const { currentUser } = useAuth();

  const theme = useMemo(
    () =>
      createTheme({
        ...((currentUser as any)
          .hasCustomTheme /* || true when we want to add a custom theme */
          ? getDesignTokens(mode)
          : {
              palette: {
                mode,
              },
            }),
        components: {
          MuiCardContent: {
            styleOverrides: { root: { padding: '32px' } },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
        },
      }),
    [currentUser, mode]
  );

  const value: ThemeContextType = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) =>
          prevMode === EThemeType.Light ? EThemeType.Dark : EThemeType.Light
        );
      },
      theme: mode,
    }),
    [mode, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
