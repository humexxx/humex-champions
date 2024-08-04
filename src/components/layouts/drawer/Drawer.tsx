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

const mainMenuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/client/dashboard',
  },
  {
    text: 'Finances',
    icon: <AccountBalanceIcon />,
    path: '/client/finances',
  },
  { text: 'Health', icon: <HealthAndSafetyIcon />, path: '/client/health' },
  { text: 'Goals', icon: <FlagIcon />, path: '/client/goals' },
];

const secondaryMenuItems = [
  { text: 'Miembros', icon: <PeopleIcon />, path: '/client/members' },
  { text: 'Grupos', icon: <GroupIcon />, path: '/client/groups' },
];

const Drawer = () => {
  const location = useLocation();

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
