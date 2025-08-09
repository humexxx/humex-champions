import { createContext, PropsWithChildren, useMemo } from 'react';

import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { LOCAL_STORAGE_KEYS } from 'src/consts';
import { EThemeType } from 'src/enums';
import { useLocalStorage } from 'src/hooks';
import getTheme from 'src/lib/theme';

export interface ThemeContextType {
  toggleColorMode: () => void;
  theme: EThemeType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export default ThemeContext;

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useLocalStorage<EThemeType>(
    LOCAL_STORAGE_KEYS.THEME,
    EThemeType.Light
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

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
