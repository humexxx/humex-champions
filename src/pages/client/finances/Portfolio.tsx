import { Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const PortfolioPage = () => {
  return (
    <>
      <Breadcrumbs aria-label="navigator">
        <Link
          to="/client/finances"
          unstable_viewTransition
          style={{ textDecoration: 'none' }}
        >
          Finances
        </Link>
        <Typography
          variant="h6"
          style={{
            viewTransitionName: 'portfolio',
          }}
        >
          Portfolio
        </Typography>
      </Breadcrumbs>
    </>
  );
};

export default PortfolioPage;
