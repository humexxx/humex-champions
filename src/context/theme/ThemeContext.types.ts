import { ReactNode } from 'react';

export interface ThemeContextType {
  toggleColorMode: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
