import { useContext } from 'react';

import ThemeContext, { ThemeContextType } from '../ThemeContext';

export default function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within an ThemeProvider');
  }
  return context;
}
