import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ROUTES, ROUTE_METADATA } from '../consts';
import { generateBreadcrumbs, getRouteMetadata } from '../routes';

/**
 * Custom hook for route-related utilities
 */
export const useRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);

  const routeMetadata = useMemo(() => {
    return (
      getRouteMetadata(currentRoute) ||
      ROUTE_METADATA[currentRoute as keyof typeof ROUTE_METADATA]
    );
  }, [currentRoute]);

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(currentRoute);
  }, [currentRoute]);

  const isFinancesRoute = useMemo(() => {
    return currentRoute.startsWith('/portal/finances');
  }, [currentRoute]);

  const isHealthRoute = useMemo(() => {
    return currentRoute.startsWith('/portal/health');
  }, [currentRoute]);

  const isUpliftRoute = useMemo(() => {
    return currentRoute.startsWith('/portal/uplift');
  }, [currentRoute]);

  const isEntertainmentRoute = useMemo(() => {
    return currentRoute.startsWith('/portal/entertainment');
  }, [currentRoute]);

  const navigateToRoute = (route: string, options?: { replace?: boolean }) => {
    navigate(route, options);
  };

  const navigateToFinances = (
    subRoute?: keyof typeof ROUTES.PORTAL.FINANCES
  ) => {
    const route = subRoute
      ? ROUTES.PORTAL.FINANCES[subRoute]
      : ROUTES.PORTAL.FINANCES.INDEX;
    navigate(route);
  };

  const navigateToHealth = (subRoute?: keyof typeof ROUTES.PORTAL.HEALTH) => {
    const route = subRoute
      ? ROUTES.PORTAL.HEALTH[subRoute]
      : ROUTES.PORTAL.HEALTH.INDEX;
    navigate(route);
  };

  const navigateToUplift = (subRoute?: keyof typeof ROUTES.PORTAL.UPLIFT) => {
    const route = subRoute
      ? ROUTES.PORTAL.UPLIFT[subRoute]
      : ROUTES.PORTAL.UPLIFT.INDEX;
    navigate(route);
  };

  const navigateToEntertainment = (
    subRoute?: keyof typeof ROUTES.PORTAL.ENTERTAINMENT
  ) => {
    const route = subRoute
      ? ROUTES.PORTAL.ENTERTAINMENT[subRoute]
      : ROUTES.PORTAL.ENTERTAINMENT.INDEX;
    navigate(route);
  };

  return {
    currentRoute,
    routeMetadata,
    breadcrumbs,
    isFinancesRoute,
    isHealthRoute,
    isUpliftRoute,
    isEntertainmentRoute,
    navigateToRoute,
    navigateToFinances,
    navigateToHealth,
    navigateToUplift,
    navigateToEntertainment,
  };
};

export default useRoutes;
