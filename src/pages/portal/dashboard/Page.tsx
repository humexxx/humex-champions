import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { Page } from 'src/components/layout';
import { ROUTES } from 'src/consts';

import { MetricsCard } from './_components';
import useSummary from './useSummary';

const DashboardPage = () => {
  const { data, loading } = useSummary();

  console.log(data);

  return (
    <Page title="Dashboard" useContainer={false}>
      <Box
        component={'section'}
        sx={{
          bgcolor: 'black',
          borderRadius: {
            md: 0,
            lg: 4,
          },
          mx: {
            sm: 0,
            md: 2,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6" component="h1" color="common.white">
            Dashboard
          </Typography>
          <Box height={300}></Box>
        </Container>
      </Box>
      <Box
        sx={{
          mt: -8,
          mx: {
            sm: 0,
            md: 2,
          },
        }}
      >
        <Box component={'section'}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <MetricsCard
                  title="Finances"
                  icon={<ShowChartIcon />}
                  loading={loading}
                  redirectPath={ROUTES.PORTAL.FINANCES.INDEX}
                >
                  <Stack direction={'column'}>
                    <Typography variant="body1">Financial Score</Typography>
                    <Typography component={'p'} variant="h1">
                      {data?.finance.financeScore}
                    </Typography>
                  </Stack>
                </MetricsCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <MetricsCard title="Page Views" loading={loading} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <MetricsCard title="Bounce Rate" loading={loading} />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </Page>
  );
};

export default DashboardPage;
