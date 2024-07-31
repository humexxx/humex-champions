import { Box, IconButton, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PortfolioPage = () => {
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
          viewTransitionName: 'portfolio',
        }}
      >
        Portfolio
      </Typography>
    </Box>
  );
};

export default PortfolioPage;
