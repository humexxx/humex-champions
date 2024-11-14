import { useMemo, version } from 'react';

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
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import AdminGuard from 'src/components/auth/AdminGuard';
import { MAIN_HEADER_HEIGHT } from './Header';

const Sidebar = ({ title, version }: { title: string; version: string }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const statisticsRoutes = useMemo(
    () => [
      {
        text: t('dashboard.title'),
        icon: <DashboardIcon />,
        path: '/client/dashboard',
      },
    ],
    [t]
  );

  const selfDevelopmentRoutes = useMemo(
    () => [
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

  const socialRoutes = useMemo(
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
              selected={location.pathname.includes('/client/admin')}
              component={NavLink}
              to="/client/admin"
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t('admin.title')} />
            </ListItemButton>
          </ListItem>
        </AdminGuard>
        <ListItem>
          <ListItemButton
            sx={{ borderRadius: 2 }}
            selected={location.pathname.includes('/client/settings')}
            component={NavLink}
            to="/client/settings"
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings.title')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export const SIDEBAR_WIDTH = 240;

export default Sidebar;
