import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from 'src/consts';
import { useThemeContext } from 'src/context/hooks';
import { auth } from 'src/firebase';

import { SIDEBAR_WIDTH } from './Sidebar';

export const MAIN_HEADER_HEIGHT = 88;

const Header = () => {
  const theme = useTheme();
  const themeContext = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const getSubRoutes = useMemo(() => {
    const pathname = location.pathname;

    if (pathname.startsWith('/portal/finances')) {
      return {
        title: 'Finances',
        routes: [
          {
            label: 'Personal Finances',
            path: ROUTES.PORTAL.FINANCES.PERSONAL_FINANCES,
          },
          { label: 'Portfolio', path: ROUTES.PORTAL.FINANCES.PORTFOLIO },
          {
            label: 'Trading Journal',
            path: ROUTES.PORTAL.FINANCES.TRADING_JOURNAL,
            disabled: true,
          },
          {
            label: 'Compound Calculator',
            path: ROUTES.PORTAL.FINANCES.COMPOUND_CALCULATOR,
          },
        ],
      };
    }

    if (pathname.startsWith('/portal/health')) {
      return {
        title: 'Health',
        routes: [
          { label: 'Calculator', path: ROUTES.PORTAL.HEALTH.CALCULATOR },
          { label: 'Nutrition', path: ROUTES.PORTAL.HEALTH.NUTRITION },
          {
            label: 'Training Program',
            path: ROUTES.PORTAL.HEALTH.TRAINING_PROGRAM,
          },
        ],
      };
    }

    if (pathname.startsWith('/portal/uplift')) {
      return {
        title: 'Uplift',
        routes: [
          { label: 'Pathway', path: ROUTES.PORTAL.UPLIFT.PATHWAY },
          { label: 'Planner', path: ROUTES.PORTAL.UPLIFT.PLANNER },
          { label: 'Analytics', path: ROUTES.PORTAL.UPLIFT.ANALYTICS },
        ],
      };
    }

    if (pathname.startsWith('/portal/entertainment')) {
      return {
        title: 'Entertainment',
        routes: [
          { label: 'YouTube', path: ROUTES.PORTAL.ENTERTAINMENT.YOUTUBE },
          { label: 'Trips', path: ROUTES.PORTAL.ENTERTAINMENT.TRIPS },
          { label: 'Formula 1', path: ROUTES.PORTAL.ENTERTAINMENT.F1 },
          { label: 'Soccer', path: ROUTES.PORTAL.ENTERTAINMENT.SOCCER },
        ],
      };
    }

    return null;
  }, [location.pathname]);

  const isRouteActive = (routePath: string) => {
    return location.pathname === routePath;
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleLogout() {
    auth
      .signOut()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error(error);
      });
    handleClose();
  }

  function handleSettings() {
    navigate('/portal/settings');
    handleClose();
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: MAIN_HEADER_HEIGHT,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        color: 'text.primary',
        bgcolor: 'background.default',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        borderRadius: 0,
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${MAIN_HEADER_HEIGHT}px !important`,
          height: MAIN_HEADER_HEIGHT,
          gap: 1,
          p: '0 !important',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {getSubRoutes && (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                ml: 2,
                alignItems: 'center',
              }}
            >
              {getSubRoutes.routes.map((route) => (
                <Link
                  key={route.path}
                  component={RouterLink}
                  to={route.path}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    fontWeight: isRouteActive(route.path) ? 600 : 400,
                    opacity: (route as any).disabled ? 0.5 : 1,
                    pointerEvents: (route as any).disabled ? 'none' : 'auto',
                  }}
                >
                  {route.label}
                </Link>
              ))}
            </Box>
          )}
          <Box>
            <IconButton color="inherit" onClick={themeContext.toggleColorMode}>
              {theme.palette.mode === 'dark' ? (
                <Brightness4Icon />
              ) : (
                <Brightness7Icon />
              )}
            </IconButton>
            <IconButton onClick={handleAvatarClick}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                }}
              >
                U
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleSettings}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
