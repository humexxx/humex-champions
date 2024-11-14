import * as React from 'react';

import { Box, Container, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { PrivateRoute } from 'src/components/auth';
import { VERSION } from 'src/consts';
import { ThemeProvider } from 'src/context/theme';

import { Header, Sidebar } from './components';
import { MAIN_HEADER_HEIGHT } from './components/Header';
import { SIDEBAR_WIDTH } from './components/Sidebar';

function ClientLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="nav"
        sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
            },
          }}
        >
          <Sidebar title="Champions" version={VERSION} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
            },
          }}
          open
        >
          <Sidebar title="Champions" version={VERSION} />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          backgroundColor: 'background.default',
          minHeight: `calc(100vh - ${MAIN_HEADER_HEIGHT}px)`,
          marginTop: `${MAIN_HEADER_HEIGHT}px`,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default function ClientLayoutWrapper() {
  return (
    <PrivateRoute>
      <ThemeProvider>
        <ClientLayout />
      </ThemeProvider>
    </PrivateRoute>
  );
}
