import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { PrivateRoute } from 'src/components/auth';

import { Header, Sidebar } from './components';
import { MAIN_HEADER_HEIGHT } from './components/Header';
import { SIDEBAR_WIDTH } from './components/Sidebar';

function ClientLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Sidebar />
      <Box
        component={'main'}
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          minHeight: `calc(100vh - ${MAIN_HEADER_HEIGHT}px)`,
          marginTop: `${MAIN_HEADER_HEIGHT}px`,
          marginLeft: `${SIDEBAR_WIDTH}px`,
          paddingY: '2rem',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default function ClientLayoutWrapper() {
  return (
    <PrivateRoute>
      <ClientLayout />
    </PrivateRoute>
  );
}
