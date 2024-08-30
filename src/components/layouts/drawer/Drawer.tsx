import { NavLink, useLocation } from 'react-router-dom';
import {
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

const Drawer = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const mainMenuItems = useMemo(
    () => [
      {
        text: t('dashboard.title'),
        icon: <DashboardIcon />,
        path: '/client/dashboard',
      },
      {
        text: t('finances.title'),
        icon: <AccountBalanceIcon />,
        path: '/client/finances',
      },
      {
        text: t('health.title'),
        icon: <DirectionsRunIcon />,
        path: '/client/health',
      },
      { text: t('uplift.title'), icon: <FlagIcon />, path: '/client/uplift' },
      {
        text: t('entertainment.title'),
        icon: <AddReactionIcon />,
        path: '/client/entretainment',
      },
    ],
    [t]
  );

  const secondaryMenuItems = useMemo(
    () => [
      {
        text: t('members.title'),
        icon: <PeopleIcon />,
        path: '/client/members',
      },
      { text: t('groups.title'), icon: <GroupIcon />, path: '/client/groups' },
    ],
    [t]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Divider />
      <List>
        {mainMenuItems.map(({ text, icon, path }) => (
          <ListItem key={text}>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(path)}
              component={NavLink}
              to={path}
              unstable_viewTransition
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {secondaryMenuItems.map(({ text, icon, path }) => (
          <ListItem key={text}>
            <ListItemButton
              sx={{ borderRadius: 2 }}
              selected={location.pathname.includes(path)}
              component={NavLink}
              to={path}
              unstable_viewTransition
              disabled
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List>
        <ListItem>
          <ListItemButton
            sx={{ borderRadius: 2 }}
            selected={location.pathname.includes('/client/settings')}
            component={NavLink}
            to="/client/settings"
            unstable_viewTransition
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

export const DRAWER_WIDTH = 240;

export default Drawer;
