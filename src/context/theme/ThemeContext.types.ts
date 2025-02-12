import { ReactNode } from 'react';

import { EThemeType } from 'src/enums';

export interface ThemeContextType {
  toggleColorMode: () => void;
  theme: EThemeType;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
