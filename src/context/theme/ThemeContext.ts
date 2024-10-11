import { createContext } from 'react';

import { ThemeContextType } from './ThemeContext.types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
