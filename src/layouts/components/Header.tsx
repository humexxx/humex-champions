import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Toolbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const getCurrentTabValue = () => {
    if (!getSubRoutes) return false;
    return getSubRoutes.routes.findIndex(
      (route) => route.path === location.pathname
    );
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (getSubRoutes && getSubRoutes.routes[newValue]) {
      navigate(getSubRoutes.routes[newValue].path);
    }
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
          gap: 2,
        }}
      >
        {getSubRoutes && (
          <Tabs
            value={getCurrentTabValue()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              ml: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                fontSize: '0.875rem',
                minHeight: 48,
              },
            }}
          >
            {getSubRoutes.routes.map((route) => (
              <Tab
                key={route.path}
                label={route.label}
                disabled={(route as any).disabled}
              />
            ))}
          </Tabs>
        )}
        <Box sx={{ flexGrow: 1 }} />
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
      </Toolbar>
    </AppBar>
  );
};

export default Header;
