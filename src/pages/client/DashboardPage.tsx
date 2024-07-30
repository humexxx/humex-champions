import { Grid, Typography } from '@mui/material';
import {
  DenseAnalyticCard,
  UniqueVisitorCard,
  IncomeOverviewCard,
} from 'src/components/pages/client/dashboard';

const DashboardPage = () => {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <DenseAnalyticCard
          title="Total Savings"
          count="4,42,236"
          percentage={10.3}
          extra="442,000"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <DenseAnalyticCard
          title="Total Fat Burn"
          count="10,500"
          percentage={70.5}
          extra="8,900"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <DenseAnalyticCard
          title="Total Daily Goals Streak"
          count="5"
          percentage={27.4}
          extra="1,943"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <DenseAnalyticCard
          title="Total P/L Trading"
          count="$35,078"
          percentage={27.4}
          isLoss
          extra="$20,395"
        />
      </Grid>

      <Grid
        item
        md={8}
        sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }}
      />

      <Grid item xs={12} md={6}>
        <UniqueVisitorCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <IncomeOverviewCard />
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
