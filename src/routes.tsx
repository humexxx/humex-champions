import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AutoLogRoute } from './components/auth';
import ClientLayout from './layouts/ClientLayout';
import {
  LandingPage,
  ErrorPage,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
} from './pages';
import { DashboardPage, SettingsPage } from './pages/client';
import { AdminPage } from './pages/client/Admin';
import {
  EntertainmentPage,
  TripsPage,
  YouTubePage,
} from './pages/client/Entertainment';
import {
  PersonalFinancesPage,
  TradingJournalPage,
  PortfolioPage,
  CompoundCalculatorPage,
  FinancesPage,
} from './pages/client/Finances';
import {
  HealthCalculatorPage,
  HealthPage,
  NutritionPage,
  TrainingProgramPage,
} from './pages/client/Health';
import { PlannerPage, PathwayPage, UpliftPage } from './pages/client/Uplift';

const financeRoutes = [
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
];

const healthRoutes = [
  {
    path: '/client/health',
    element: <HealthPage />,
  },
  {
    path: '/client/health/calculator',
    element: <HealthCalculatorPage />,
  },
  {
    path: '/client/health/nutrition',
    element: <NutritionPage />,
  },
  {
    path: '/client/health/training-program',
    element: <TrainingProgramPage />,
  },
];

const upliftRoutes = [
  {
    path: '/client/uplift',
    element: <UpliftPage />,
  },
  {
    path: '/client/uplift/pathway',
    element: <PathwayPage />,
  },
  {
    path: '/client/uplift/planner',
    element: <PlannerPage />,
  },
];

const entertainmentRoutes = [
  {
    path: '/client/entretainment',
    element: <EntertainmentPage />,
  },
  {
    path: '/client/entretainment/youtube',
    element: <YouTubePage />,
  },
  {
    path: '/client/entretainment/trips',
    element: <TripsPage />,
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
    element: (
      <AutoLogRoute>
        <SignUpPage />
      </AutoLogRoute>
    ),
  },
  {
    path: '/sign-in',
    element: <Navigate replace to="/login" />,
  },
  {
    path: '/login',
    element: (
      <AutoLogRoute>
        <SignInPage />
      </AutoLogRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AutoLogRoute>
        <ForgotPasswordPage />
      </AutoLogRoute>
    ),
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
        path: '/client/admin',
        element: <AdminPage />,
      },
      {
        path: '/client/settings',
        element: <SettingsPage />,
      },
      ...financeRoutes,
      ...healthRoutes,
      ...upliftRoutes,
      ...entertainmentRoutes,
    ],
  },
]);
