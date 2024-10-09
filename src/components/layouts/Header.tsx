import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { DRAWER_WIDTH } from './drawer';
import { useThemeContext } from 'src/context/theme';
import { auth } from 'src/firebase';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import TranslateIcon from '@mui/icons-material/Translate';
import { useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

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
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" flexGrow="1">
          Champions
        </Typography>
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
