import { Box, Breadcrumbs, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DebtCard,
  IncomeCard,
} from 'src/components/pages/client/finances/personal-finances';

const PersonalFinancesPage = () => {
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
            viewTransitionName: 'personal-finances',
          }}
        >
          Personal Finances
        </Typography>
      </Breadcrumbs>
      <Box mt={4}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <DebtCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <IncomeCard />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PersonalFinancesPage;
