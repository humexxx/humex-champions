import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import ClientLayout from './layouts/ClientLayout.tsx';
import SignInPage from './pages/SignInPage.tsx';
import DashboardPage from './pages/client/DashboardPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Hello world!</div>,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signin',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
