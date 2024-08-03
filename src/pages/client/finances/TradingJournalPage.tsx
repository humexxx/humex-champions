import { Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const TradingJournalPage = () => {
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
            viewTransitionName: 'trading-journal',
          }}
        >
          Trading Journal
        </Typography>
      </Breadcrumbs>
    </>
  );
};

export default TradingJournalPage;
