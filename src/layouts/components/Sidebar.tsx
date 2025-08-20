import { useMemo } from 'react';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Typography,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import AdminGuard from 'src/components/auth/AdminGuard';
import { ROUTES } from 'src/consts';

import { MAIN_HEADER_HEIGHT } from './Header';

const Sidebar = ({
  title,
  version,
  closeSidebar,
}: {
  title: string;
  version: string;
  closeSidebar: () => void;
}) => {
  const location = useLocation();

  const statisticsRoutes = useMemo(
    () => [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: ROUTES.PORTAL.DASHBOARD,
      },
    ],
    []
  );

  const selfDevelopmentRoutes = useMemo(
    () => [
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

  const socialRoutes = useMemo(
    () => [
      {
        text: 'Members',
        icon: <PeopleIcon />,
        path: ROUTES.PORTAL.SOCIAL.MEMBERS,
      },
      {
        text: 'Groups',
        icon: <GroupIcon />,
        path: ROUTES.PORTAL.SOCIAL.GROUPS,
      },
    ],
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          minHeight: `${MAIN_HEADER_HEIGHT}px !important`,
          height: MAIN_HEADER_HEIGHT,
        }}
      >
        <Typography variant="h6" component="div" sx={{ position: 'relative' }}>
          {title}{' '}
          <Typography
            mb={2}
            variant="caption"
            sx={{ position: 'absolute', top: 2, ml: 1 }}
          >
            ({version})
          </Typography>
        </Typography>
      </Toolbar>
      <Divider />

      <List dense>
        {statisticsRoutes.map(({ text, icon, path }) => (
          <ListItem key={text}>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(path)}
              component={NavLink}
              to={path}
              onClick={closeSidebar}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        <ListItem>
          <Typography variant="caption" ml={2}>
            Self Development
          </Typography>
        </ListItem>
        {selfDevelopmentRoutes.map(({ text, icon, path }) => (
          <ListItem key={text}>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(path)}
              component={NavLink}
              to={path}
              onClick={closeSidebar}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List sx={{ flexGrow: 1 }} dense>
        <ListItem>
          <Typography variant="caption" ml={2}>
            Social
          </Typography>
        </ListItem>
        {socialRoutes.map(({ text, icon, path }) => (
          <ListItem key={text}>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(path)}
              component={NavLink}
              to={path}
              onClick={closeSidebar}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        <AdminGuard>
          <ListItem>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(ROUTES.PORTAL.ADMIN.INDEX)}
              component={NavLink}
              to={ROUTES.PORTAL.ADMIN.INDEX}
              onClick={closeSidebar}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        </AdminGuard>
        <ListItem>
          <ListItemButton
            sx={{ borderRadius: 2 }}
            selected={location.pathname.includes(ROUTES.PORTAL.SETTINGS)}
            component={NavLink}
            to={ROUTES.PORTAL.SETTINGS}
            onClick={closeSidebar}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export const SIDEBAR_WIDTH = 240;

export default Sidebar;
