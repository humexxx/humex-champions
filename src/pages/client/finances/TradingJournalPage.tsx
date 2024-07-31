import { Box, IconButton, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TradingJournalPage = () => {
  return (
    <Box display="flex" alignItems="center">
      <IconButton
        component={Link}
        to="/client/finances"
        unstable_viewTransition
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h5"
        component="div"
        style={{
          viewTransitionName: 'trading-journal',
        }}
      >
        Trading Journal
      </Typography>
    </Box>
  );
};

export default TradingJournalPage;
