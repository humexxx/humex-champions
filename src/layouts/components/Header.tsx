import { useRef, useState } from 'react';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from 'src/assets/images/logo.png';
import { VERSION } from 'src/consts';
import { useThemeContext } from 'src/context/theme';
import { auth } from 'src/firebase';

export const MAIN_HEADER_HEIGHT = 56;

interface Props {
  handleDrawerToggle: () => void;
}

const Header = ({ handleDrawerToggle }: Props) => {
  const theme = useTheme();
  const themeContext = useThemeContext();
  const navigate = useNavigate();
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { i18n } = useTranslation();

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

  const handleLanguageOnChange = (language: string) => () => {
    setLanguageMenuOpen(false);
    i18n.changeLanguage(language);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        height: MAIN_HEADER_HEIGHT,
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
        <Box flexGrow="1" display={'flex'} alignItems={'center'}>
          {/* <img src={logo} alt="Logo" height={25} /> */}
          <Typography variant="h6" component="h1">
            Champions
          </Typography>
          <Typography ml={1} variant="caption">
            ({VERSION})
          </Typography>
        </Box>
        <IconButton
          color="inherit"
          ref={menuRef}
          onClick={() => setLanguageMenuOpen(true)}
        >
          <TranslateIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={menuRef.current}
          open={isLanguageMenuOpen}
          onClose={() => setLanguageMenuOpen(false)}
        >
          <MenuItem onClick={handleLanguageOnChange('en')}>English</MenuItem>
          <MenuItem onClick={handleLanguageOnChange('es')}>Español</MenuItem>
        </Menu>
        <IconButton
          sx={{ ml: 2 }}
          onClick={themeContext.toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode === 'dark' ? (
            <Brightness4Icon />
          ) : (
            <Brightness7Icon />
          )}
        </IconButton>
        <IconButton
          color="inherit"
          edge="end"
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
