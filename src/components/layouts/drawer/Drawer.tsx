import { NavLink, useLocation } from 'react-router-dom';
import {
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const Drawer = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const mainMenuItems = useMemo(
    () => [
      {
        text: t('routes.dashboard'),
        icon: <DashboardIcon />,
        path: '/client/dashboard',
      },
      {
        text: t('routes.finances'),
        icon: <AccountBalanceIcon />,
        path: '/client/finances',
      },
      {
        text: t('routes.health'),
        icon: <HealthAndSafetyIcon />,
        path: '/client/health',
      },
      { text: t('routes.goals'), icon: <FlagIcon />, path: '/client/goals' },
    ],
    [t]
  );

  const secondaryMenuItems = useMemo(
    () => [
      {
        text: t('routes.members'),
        icon: <PeopleIcon />,
        path: '/client/members',
      },
      { text: t('routes.groups'), icon: <GroupIcon />, path: '/client/groups' },
    ],
    [t]
  );

  return (
    <div>
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
      <List>
        {secondaryMenuItems.map(({ text, icon, path }) => (
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
    </div>
  );
};

export const DRAWER_WIDTH = 240;

export default Drawer;
