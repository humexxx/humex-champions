import { useMemo } from 'react';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FlagIcon from '@mui/icons-material/Flag';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import ChampionsLogo from 'src/assets/images/Logo';
import AdminGuard from 'src/components/auth/AdminGuard';
import { ROUTES } from 'src/consts';

import { MAIN_HEADER_HEIGHT } from './Header';

const Sidebar = () => {
  const location = useLocation();

  const mainRoutes = useMemo(
    () => [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: ROUTES.PORTAL.DASHBOARD,
      },
      {
        text: 'Finances',
        icon: <AccountBalanceIcon />,
        path: ROUTES.PORTAL.FINANCES.INDEX,
      },
      {
        text: 'Health',
        icon: <DirectionsRunIcon />,
        path: ROUTES.PORTAL.HEALTH.INDEX,
      },
      {
        text: 'Uplift',
        icon: <FlagIcon />,
        path: ROUTES.PORTAL.UPLIFT.INDEX,
      },
      {
        text: 'Entertainment',
        icon: <AddReactionIcon />,
        path: ROUTES.PORTAL.ENTERTAINMENT.INDEX,
      },
    ],
    []
  );

  const isRouteActive = (path: string) => {
    if (path === ROUTES.PORTAL.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        bgcolor: '#f7f8fa',
        zIndex: 1200,
      }}
    >
      {/* Logo section */}
      <Box
        sx={{
          height: MAIN_HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChampionsLogo width={60} height={40} />
      </Box>

      {/* Main navigation icons */}
      <List sx={{ py: 2, flex: 1, overflow: 'auto' }}>
        {mainRoutes.map(({ text, icon, path }) => (
          <ListItem key={text} sx={{ px: 1, py: 0.5 }}>
            <Tooltip title={text} placement="right">
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  justifyContent: 'center',
                  px: 2,
                  bgcolor: isRouteActive(path) ? 'primary.main' : 'transparent',
                  color: isRouteActive(path)
                    ? 'primary.contrastText'
                    : 'text.primary',
                  '&:hover': {
                    bgcolor: isRouteActive(path)
                      ? 'primary.dark'
                      : 'action.hover',
                  },
                }}
                component={NavLink}
                to={path}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: 'inherit',
                  }}
                >
                  {icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Bottom settings and admin */}
      <Box sx={{ pb: 2 }}>
        <List>
          <AdminGuard>
            <ListItem sx={{ px: 1, py: 0.5 }}>
              <Tooltip title="Admin" placement="right">
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: 'center',
                    px: 2,
                    bgcolor: isRouteActive(ROUTES.PORTAL.ADMIN.INDEX)
                      ? 'primary.main'
                      : 'transparent',
                    color: isRouteActive(ROUTES.PORTAL.ADMIN.INDEX)
                      ? 'primary.contrastText'
                      : 'text.primary',
                    '&:hover': {
                      bgcolor: isRouteActive(ROUTES.PORTAL.ADMIN.INDEX)
                        ? 'primary.dark'
                        : 'action.hover',
                    },
                  }}
                  component={NavLink}
                  to={ROUTES.PORTAL.ADMIN.INDEX}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </AdminGuard>

          <ListItem sx={{ px: 1, py: 0.5 }}>
            <Tooltip title="Settings" placement="right">
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  justifyContent: 'center',
                  px: 2,
                  bgcolor: isRouteActive(ROUTES.PORTAL.SETTINGS)
                    ? 'primary.main'
                    : 'transparent',
                  color: isRouteActive(ROUTES.PORTAL.SETTINGS)
                    ? 'primary.contrastText'
                    : 'text.primary',
                  '&:hover': {
                    bgcolor: isRouteActive(ROUTES.PORTAL.SETTINGS)
                      ? 'primary.dark'
                      : 'action.hover',
                  },
                }}
                component={NavLink}
                to={ROUTES.PORTAL.SETTINGS}
              >
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <SettingsIcon />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export const SIDEBAR_WIDTH = 72; // Reduced width for icon-only sidebar

export default Sidebar;
