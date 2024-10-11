import { CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './context/auth';
import { router } from './routes.tsx';

import './i18n.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AuthProvider>
      <CssBaseline />
      <RouterProvider router={router} />
    </AuthProvider>
  </LocalizationProvider>
  // </React.StrictMode>
);
