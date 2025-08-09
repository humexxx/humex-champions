import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, IconButton, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from 'src/context/hooks';
import { EThemeType } from 'src/enums';
import { auth } from 'src/firebase';

import { SIDEBAR_WIDTH } from './Sidebar';

export const MAIN_HEADER_HEIGHT = 56;

interface Props {
  handleDrawerToggle: () => void;
}

const Header = ({ handleDrawerToggle }: Props) => {
  const theme = useTheme();
  const themeContext = useThemeContext();
  const navigate = useNavigate();

  function handleLogout() {
    auth
      .signOut()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: MAIN_HEADER_HEIGHT,
        width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { lg: `${SIDEBAR_WIDTH}px` },
        display: 'flex',
        color: 'text.primary',
        justifyContent: 'space-between',
        bgcolor:
          themeContext.theme === EThemeType.Light ? '#fafafa' : 'grey.900',
        // bgcolor: "hsla(0, 0%, 100%, 0.6)",
        // backdropFilter: "blur(50px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${MAIN_HEADER_HEIGHT}px !important`,
          height: MAIN_HEADER_HEIGHT,
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { lg: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box flexGrow="1" display={'flex'} alignItems={'center'} />
        <IconButton
          color="inherit"
          onClick={themeContext.toggleColorMode}
          sx={{ ml: 2 }}
        >
          {theme.palette.mode === 'dark' ? (
            <Brightness4Icon />
          ) : (
            <Brightness7Icon />
          )}
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleLogout}
          sx={{ ml: 2 }}
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
