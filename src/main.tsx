import { CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from 'src/context';

import { loadI18n } from './i18n.ts';
import { router } from './routes.tsx';
import { LocalizationProvider } from '@mui/x-date-pickers';

const root = ReactDOM.createRoot(document.getElementById('root')!);

loadI18n().then(() => {
  root.render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <ThemeProvider>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
});
