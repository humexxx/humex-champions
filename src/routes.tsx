import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import {
  LandingPage,
  ErrorPage,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
} from './pages';
import { DashboardPage, SettingsPage } from './pages/client';
import {
  PersonalFinancesPage,
  TradingJournalPage,
  PortfolioPage,
  CompoundCalculatorPage,
  FinancesPage,
} from './pages/client/Finances';
import { ChecklistPage, PathwayPage, UpliftPage } from './pages/client/Uplift';
import {
  HealthCalculatorPage,
  HealthPage,
  NutritionPage,
  TrainingProgramPage,
} from './pages/client/Health';
import {
  EntertainmentPage,
  TripsPage,
  YouTubePage,
} from './pages/client/Entertainment';

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
    path: '/client/uplift/checklist',
    element: <ChecklistPage />,
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
        path: '/client/settings',
        element: <SettingsPage />,
      },
      {
        path: '/client/health',
        element: <HealthPage />,
      },
      ...financeRoutes,
      ...healthRoutes,
      ...upliftRoutes,
      ...entertainmentRoutes,
    ],
  },
]);
