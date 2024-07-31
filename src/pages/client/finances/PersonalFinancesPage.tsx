import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const PersonalFinancesPage = () => {
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
          viewTransitionName: 'personal-finances',
        }}
      >
        Personal Finances
      </Typography>
    </Box>
  );
};

export default PersonalFinancesPage;
