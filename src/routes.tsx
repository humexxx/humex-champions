import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { AutoLogRoute } from './components/auth';
import { ROUTES } from './consts';
import ClientLayout from './layouts/ClientLayout';
import { LandingPage, ErrorPage } from './pages';
import { GlobalLoader } from './components';

// Lazy load pages
const AdminPage = lazy(() =>
  import('./pages/admin').then((module) => ({ default: module.AdminPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const SignInPage = lazy(() =>
  import('./pages/auth').then((module) => ({ default: module.SignInPage }))
);
const SignUpPage = lazy(() =>
  import('./pages/auth').then((module) => ({ default: module.SignUpPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/portal').then((module) => ({ default: module.DashboardPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/portal').then((module) => ({ default: module.SettingsPage }))
);

// Entertainment pages
const EntertainmentPage = lazy(() =>
  import('./pages/portal/entertainment').then((module) => ({
    default: module.EntertainmentPage,
  }))
);
const TripsPage = lazy(() =>
  import('./pages/portal/entertainment').then((module) => ({
    default: module.TripsPage,
  }))
);
const YouTubePage = lazy(() =>
  import('./pages/portal/entertainment').then((module) => ({
    default: module.YouTubePage,
  }))
);
const F1Page = lazy(() =>
  import('./pages/portal/entertainment').then((module) => ({
    default: module.F1Page,
  }))
);
const SoccerPage = lazy(() =>
  import('./pages/portal/entertainment').then((module) => ({
    default: module.SoccerPage,
  }))
);

// Finance pages
const PersonalFinancesPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.PersonalFinancesPage,
  }))
);
const TradingJournalPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.TradingJournalPage,
  }))
);
const PortfolioPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.PortfolioPage,
  }))
);
const CompoundCalculatorPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.CompoundCalculatorPage,
  }))
);
const FinancesPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.FinancesPage,
  }))
);

// Health pages
const HealthCalculatorPage = lazy(() =>
  import('./pages/portal/health').then((module) => ({
    default: module.HealthCalculatorPage,
  }))
);
const HealthPage = lazy(() =>
  import('./pages/portal/health').then((module) => ({
    default: module.HealthPage,
  }))
);
const NutritionPage = lazy(() =>
  import('./pages/portal/health').then((module) => ({
    default: module.NutritionPage,
  }))
);
const TrainingProgramPage = lazy(() =>
  import('./pages/portal/health').then((module) => ({
    default: module.TrainingProgramPage,
  }))
);

// Uplift pages
const PlannerPage = lazy(() =>
  import('./pages/portal/uplift').then((module) => ({
    default: module.PlannerPage,
  }))
);
const PathwayPage = lazy(() =>
  import('./pages/portal/uplift').then((module) => ({
    default: module.PathwayPage,
  }))
);
const UpliftPage = lazy(() =>
  import('./pages/portal/uplift').then((module) => ({
    default: module.UpliftPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/portal/uplift').then((module) => ({
    default: module.AnalyticsPage,
  }))
);

// Lazy wrapper component
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<GlobalLoader />}>{children}</Suspense>
);

// Route configuration types
interface RouteConfig {
  path: string;
  element: React.ReactElement;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
  };
}

// Finance routes configuration
const financeRoutes: RouteConfig[] = [
  {
    path: ROUTES.PORTAL.FINANCES.INDEX,
    element: (
      <LazyWrapper>
        <FinancesPage />
      </LazyWrapper>
    ),
    meta: { title: 'Finances - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.FINANCES.PERSONAL_FINANCES,
    element: (
      <LazyWrapper>
        <PersonalFinancesPage />
      </LazyWrapper>
    ),
    meta: { title: 'Personal Finances - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.FINANCES.TRADING_JOURNAL,
    element: (
      <LazyWrapper>
        <TradingJournalPage />
      </LazyWrapper>
    ),
    meta: { title: 'Trading Journal - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.FINANCES.PORTFOLIO,
    element: (
      <LazyWrapper>
        <PortfolioPage />
      </LazyWrapper>
    ),
    meta: { title: 'Portfolio - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.FINANCES.COMPOUND_CALCULATOR,
    element: (
      <LazyWrapper>
        <CompoundCalculatorPage />
      </LazyWrapper>
    ),
    meta: { title: 'Compound Calculator - HumEx Champions' },
  },
];

// Health routes configuration
const healthRoutes: RouteConfig[] = [
  {
    path: ROUTES.PORTAL.HEALTH.INDEX,
    element: (
      <LazyWrapper>
        <HealthPage />
      </LazyWrapper>
    ),
    meta: { title: 'Health - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.HEALTH.CALCULATOR,
    element: (
      <LazyWrapper>
        <HealthCalculatorPage />
      </LazyWrapper>
    ),
    meta: { title: 'Health Calculator - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.HEALTH.NUTRITION,
    element: (
      <LazyWrapper>
        <NutritionPage />
      </LazyWrapper>
    ),
    meta: { title: 'Nutrition - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.HEALTH.TRAINING_PROGRAM,
    element: (
      <LazyWrapper>
        <TrainingProgramPage />
      </LazyWrapper>
    ),
    meta: { title: 'Training Program - HumEx Champions' },
  },
];

// Uplift routes configuration
const upliftRoutes: RouteConfig[] = [
  {
    path: ROUTES.PORTAL.UPLIFT.INDEX,
    element: (
      <LazyWrapper>
        <UpliftPage />
      </LazyWrapper>
    ),
    meta: { title: 'Uplift - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.UPLIFT.PATHWAY,
    element: (
      <LazyWrapper>
        <PathwayPage />
      </LazyWrapper>
    ),
    meta: { title: 'Pathway - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.UPLIFT.PLANNER,
    element: (
      <LazyWrapper>
        <PlannerPage />
      </LazyWrapper>
    ),
    meta: { title: 'Planner - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.UPLIFT.ANALYTICS,
    element: (
      <LazyWrapper>
        <AnalyticsPage />
      </LazyWrapper>
    ),
    meta: { title: 'Analytics - HumEx Champions' },
  },
];

// Entertainment routes configuration
const entertainmentRoutes: RouteConfig[] = [
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.INDEX,
    element: (
      <LazyWrapper>
        <EntertainmentPage />
      </LazyWrapper>
    ),
    meta: { title: 'Entertainment - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.YOUTUBE,
    element: (
      <LazyWrapper>
        <YouTubePage />
      </LazyWrapper>
    ),
    meta: { title: 'YouTube - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.TRIPS,
    element: (
      <LazyWrapper>
        <TripsPage />
      </LazyWrapper>
    ),
    meta: { title: 'Trips - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.F1,
    element: (
      <LazyWrapper>
        <F1Page />
      </LazyWrapper>
    ),
    meta: { title: 'Formula 1 - HumEx Champions' },
  },
  {
    path: ROUTES.PORTAL.ENTERTAINMENT.SOCCER,
    element: (
      <LazyWrapper>
        <SoccerPage />
      </LazyWrapper>
    ),
    meta: { title: 'Soccer - HumEx Champions' },
  },
];

// Main router configuration
export const router = createBrowserRouter([
  // Landing page
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },

  // Authentication routes (public)
  {
    path: ROUTES.AUTH.SIGN_UP,
    element: (
      <AutoLogRoute>
        <LazyWrapper>
          <SignUpPage />
        </LazyWrapper>
      </AutoLogRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: ROUTES.AUTH.SIGN_IN,
    element: <Navigate replace to={ROUTES.AUTH.LOGIN} />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: (
      <AutoLogRoute>
        <LazyWrapper>
          <SignInPage />
        </LazyWrapper>
      </AutoLogRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: (
      <AutoLogRoute>
        <LazyWrapper>
          <ForgotPasswordPage />
        </LazyWrapper>
      </AutoLogRoute>
    ),
    errorElement: <ErrorPage />,
  },

  // Protected portal routes
  {
    path: ROUTES.PORTAL.INDEX,
    element: <ClientLayout />, // Already has PrivateRoute protection
    errorElement: <ErrorPage />,
    children: [
      // Default redirect to dashboard
      {
        index: true,
        element: <Navigate replace to={ROUTES.PORTAL.DASHBOARD} />,
      },

      // Core portal pages
      {
        path: ROUTES.PORTAL.DASHBOARD,
        element: (
          <LazyWrapper>
            <DashboardPage />
          </LazyWrapper>
        ),
      },
      {
        path: ROUTES.PORTAL.ADMIN.INDEX,
        element: (
          <LazyWrapper>
            <AdminPage />
          </LazyWrapper>
        ),
      },
      {
        path: ROUTES.PORTAL.SETTINGS,
        element: (
          <LazyWrapper>
            <SettingsPage />
          </LazyWrapper>
        ),
      },

      // Module routes
      ...financeRoutes,
      ...healthRoutes,
      ...upliftRoutes,
      ...entertainmentRoutes,
    ],
  },

  // Catch-all route for 404s
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

// Route utilities for accessing metadata
export const getRouteMetadata = (path: string): RouteConfig['meta'] => {
  const allRoutes = [
    ...financeRoutes,
    ...healthRoutes,
    ...upliftRoutes,
    ...entertainmentRoutes,
  ];

  const route = allRoutes.find((route) => route.path === path);
  return route?.meta;
};

// Generate breadcrumbs from route path
export const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return {
      label,
      path,
      isActive: index === segments.length - 1,
    };
  });
};

// Route validation helper
export const isValidRoute = (path: string): boolean => {
  const allPaths = [
    ...Object.values(ROUTES.PORTAL.FINANCES),
    ...Object.values(ROUTES.PORTAL.HEALTH),
    ...Object.values(ROUTES.PORTAL.UPLIFT),
    ...Object.values(ROUTES.PORTAL.ENTERTAINMENT),
    ROUTES.PORTAL.DASHBOARD,
    ROUTES.PORTAL.SETTINGS,
    ROUTES.PORTAL.ADMIN.INDEX,
  ] as string[];

  return allPaths.includes(path);
};
