import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AutoLogRoute } from './components/auth';
import { ROUTES } from './consts';
import ClientLayout from './layouts/ClientLayout';
import { LandingPage, ErrorPage } from './pages';
import { AdminPage } from './pages/admin';
import { ForgotPasswordPage, SignInPage, SignUpPage } from './pages/auth';
import { DashboardPage, SettingsPage } from './pages/portal';
import {
  EntertainmentPage,
  TripsPage,
  YouTubePage,
} from './pages/portal/entertainment';
import {
  PersonalFinancesPage,
  TradingJournalPage,
  PortfolioPage,
  CompoundCalculatorPage,
  FinancesPage,
} from './pages/portal/finances';
import {
  HealthCalculatorPage,
  HealthPage,
  NutritionPage,
  TrainingProgramPage,
} from './pages/portal/health';
import { PlannerPage, PathwayPage, UpliftPage } from './pages/portal/uplift';

const financeRoutes = [
  {
    path: ROUTES.PORTAL.FINANCES.INDEX,
    element: <FinancesPage />,
  },
  {
    path: ROUTES.PORTAL.FINANCES.PERSONAL_FINANCES,
    element: <PersonalFinancesPage />,
  },
  {
    path: ROUTES.PORTAL.FINANCES.TRADING_JOURNAL,
    element: <TradingJournalPage />,
  },
  {
    path: ROUTES.PORTAL.FINANCES.PORTFOLIO,
    element: <PortfolioPage />,
  },
  {
    path: ROUTES.PORTAL.FINANCES.COMPOUND_CALCULATOR,
    element: <CompoundCalculatorPage />,
  },
];

const healthRoutes = [
  {
    path: ROUTES.PORTAL.HEALTH.INDEX,
    element: <HealthPage />,
  },
  {
    path: ROUTES.PORTAL.HEALTH.CALCULATOR,
    element: <HealthCalculatorPage />,
  },
  {
    path: ROUTES.PORTAL.HEALTH.NUTRITION,
    element: <NutritionPage />,
  },
  {
    path: ROUTES.PORTAL.HEALTH.TRAINING_PROGRAM,
    element: <TrainingProgramPage />,
  },
];

const upliftRoutes = [
  {
    path: ROUTES.PORTAL.UPLIFT.INDEX,
    element: <UpliftPage />,
  },
  {
    path: ROUTES.PORTAL.UPLIFT.PATHWAY,
    element: <PathwayPage />,
  },
  {
    path: ROUTES.PORTAL.UPLIFT.PLANNER,
    element: <PlannerPage />,
  },
];

const entertainmentRoutes = [
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.INDEX,
    element: <EntertainmentPage />,
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.YOUTUBE,
    element: <YouTubePage />,
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.TRIPS,
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
    path: ROUTES.AUTH.SIGN_UP,
    element: (
      <AutoLogRoute>
        <SignUpPage />
      </AutoLogRoute>
    ),
  },
  {
    path: ROUTES.AUTH.SIGN_IN,
    element: <Navigate replace to={ROUTES.AUTH.LOGIN} />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: (
      <AutoLogRoute>
        <SignInPage />
      </AutoLogRoute>
    ),
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: (
      <AutoLogRoute>
        <ForgotPasswordPage />
      </AutoLogRoute>
    ),
  },
  {
    path: ROUTES.PORTAL.INDEX,
    element: <ClientLayout />,
    children: [
      {
        path: ROUTES.PORTAL.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.PORTAL.ADMIN.INDEX,
        element: <AdminPage />,
      },
      {
        path: ROUTES.PORTAL.SETTINGS,
        element: <SettingsPage />,
      },
      ...financeRoutes,
      ...healthRoutes,
      ...upliftRoutes,
      ...entertainmentRoutes,
    ],
  },
]);
