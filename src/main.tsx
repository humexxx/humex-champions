import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { AuthProvider } from './context/auth';
import { CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import './i18n.ts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';

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
