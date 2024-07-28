import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import { LandingPage, ErrorPage, SignInPage, SignUpPage } from './pages';
import DashboardPage from './pages/client/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/sign-in',
    element: <Navigate replace to="/login" />,
  },
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      {
        path: '/client/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
]);
