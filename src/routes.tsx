import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import {
  LandingPage,
  ErrorPage,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
} from './pages';
import {
  DashboardPage,
  GoalsPage,
  HealthPage,
  FinancesPage,
} from './pages/client';
import {
  PersonalFinancesPage,
  TradingJournalPage,
  PortfolioPage,
  CompoundCalculatorPage,
} from './pages/client/finances';

const upliftRoutes = [
  {
    path: '/client/uplift',
    element: <GoalsPage />,
  },
  {
    path: '/client/uplift/pathway',
    element: <GoalsPage />,
  },
  {
    path: '/client/uplift/checklist',
    element: <GoalsPage />,
  },
];

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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      {
        path: '/client/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/client/finances',
        element: <FinancesPage />,
      },
      {
        path: '/client/finances/personal-finances',
        element: <PersonalFinancesPage />,
      },
      {
        path: '/client/finances/trading-journal',
        element: <TradingJournalPage />,
      },
      {
        path: '/client/finances/portfolio',
        element: <PortfolioPage />,
      },
      {
        path: '/client/finances/compound-calculator',
        element: <CompoundCalculatorPage />,
      },
      {
        path: '/client/health',
        element: <HealthPage />,
      },
      ...upliftRoutes,
    ],
  },
]);
