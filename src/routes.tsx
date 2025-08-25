import { Component, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { GlobalLoader } from './components';
import { AutoLogRoute } from './components/auth';
import { ROUTES } from './consts';
import ClientLayout from './layouts/ClientLayout';
import { ErrorPage, LandingPage } from './pages';

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

// Health pages
const HealthCalculatorPage = lazy(() =>
  import('./pages/portal/health').then((module) => ({
    default: module.HealthCalculatorPage,
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
const AnalyticsPage = lazy(() =>
  import('./pages/portal/uplift').then((module) => ({
    default: module.AnalyticsPage,
  }))
);

// Error boundary for catching context errors during hot reload
class ErrorBoundary extends Component<
  { children: React.ReactNode; resetOnLocationChange?: boolean },
  { hasError: boolean; lastLocation?: string }
> {
  constructor(props: {
    children: React.ReactNode;
    resetOnLocationChange?: boolean;
  }) {
    super(props);
    this.state = {
      hasError: false,
      lastLocation:
        typeof window !== 'undefined' ? window.location.pathname : undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if this is a context-related error during hot reload
    if (
      error.message.includes('useAuth must be used within an AuthProvider') ||
      error.message.includes('Context is not available')
    ) {
      // In development, these are usually hot reload issues
      // Let React handle retries naturally without forcing refreshes
      if (import.meta.env.DEV) {
        console.warn(
          'Hot reload context error caught, letting React retry...',
          error
        );
        return { hasError: false };
      }
    }
    return { hasError: true };
  }

  componentDidUpdate() {
    // Reset error state when location changes
    if (this.props.resetOnLocationChange && typeof window !== 'undefined') {
      const currentLocation = window.location.pathname;
      if (this.state.lastLocation !== currentLocation && this.state.hasError) {
        console.log('Location changed, resetting error boundary');
        this.setState({
          hasError: false,
          lastLocation: currentLocation,
        });
      } else if (this.state.lastLocation !== currentLocation) {
        this.setState({ lastLocation: currentLocation });
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (
      !error.message.includes('useAuth must be used within an AuthProvider')
    ) {
      console.error('Route error boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}

// Lazy wrapper component with error boundary
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary resetOnLocationChange={true}>
    <Suspense fallback={<GlobalLoader />}>{children}</Suspense>
  </ErrorBoundary>
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
    element: <Navigate replace to={ROUTES.PORTAL.FINANCES.PERSONAL_FINANCES} />,
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
    element: <Navigate replace to={ROUTES.PORTAL.HEALTH.CALCULATOR} />,
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
    element: <Navigate replace to={ROUTES.PORTAL.UPLIFT.PATHWAY} />,
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
    element: <Navigate replace to={ROUTES.PORTAL.ENTERTAINMENT.YOUTUBE} />,
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
  {
    path: '/landing',
    element: <Navigate replace to="/" />,
  },

  // Authentication routes (public)
  {
    path: ROUTES.AUTH.SIGN_UP,
    element: (
      <LazyWrapper>
        <AutoLogRoute>
          <SignUpPage />
        </AutoLogRoute>
      </LazyWrapper>
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
      <LazyWrapper>
        <AutoLogRoute>
          <SignInPage />
        </AutoLogRoute>
      </LazyWrapper>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: (
      <LazyWrapper>
        <AutoLogRoute>
          <ForgotPasswordPage />
        </AutoLogRoute>
      </LazyWrapper>
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
