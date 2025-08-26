import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useRoutes } from '../hooks';

interface BreadcrumbNavigationProps {
  sx?: any;
  maxItems?: number;
}

interface Breadcrumb {
  label: string;
  path: string;
  isActive: boolean;
}

const BreadcrumbNavigation = ({
  sx,
  maxItems = 4,
}: BreadcrumbNavigationProps) => {
  const { breadcrumbs, navigateToRoute } = useRoutes();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single-level routes
  }

  const handleNavigate = (path: string) => {
    navigateToRoute(path);
  };

  return (
    <Box sx={{ py: 1, ...sx }}>
      <Breadcrumbs
        maxItems={maxItems}
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb navigation"
      >
        {breadcrumbs.map((crumb: Breadcrumb, index: number) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography
                key={crumb.path}
                color="text.primary"
                variant="body2"
                sx={{ fontWeight: 'medium' }}
              >
                {crumb.label}
              </Typography>
            );
          }

          return (
            <Link
              key={crumb.path}
              underline="hover"
              color="inherit"
              onClick={() => handleNavigate(crumb.path)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNavigation;
