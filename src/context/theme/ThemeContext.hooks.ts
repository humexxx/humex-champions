import { useContext } from 'react';

import ThemeContext from './ThemeContext';

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within an ThemeProvider');
  }
  return context;
}
