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
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from 'src/context/theme';
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
        height: MAIN_HEADER_HEIGHT,
        width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { lg: `${SIDEBAR_WIDTH}px` },
        display: 'flex',
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
          ref={menuRef}
          onClick={() => setLanguageMenuOpen(true)}
          sx={{ color: 'text.primary' }}
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
          sx={{ ml: 2, color: 'text.primary' }}
          onClick={themeContext.toggleColorMode}
        >
          {theme.palette.mode === 'dark' ? (
            <Brightness4Icon />
          ) : (
            <Brightness7Icon />
          )}
        </IconButton>
        <IconButton
          edge="end"
          onClick={handleLogout}
          sx={{ ml: 2, color: 'text.primary' }}
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
