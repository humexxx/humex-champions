import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Page } from 'src/components/layout';

import { MetricsCard } from './_components';

const DashboardPage = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'dashboard' });

  return (
    <Page title={t('title')} useContainer={false}>
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
              <Grid item xs={12} sm={6} lg={4}>
                <MetricsCard
                  title="Finances"
                  icon={<ShowChartIcon />}
                  loading
                  redirectPath="/client/finances"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <MetricsCard title="Page Views" />
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <MetricsCard title="Bounce Rate" />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </Page>
  );
};

export default DashboardPage;
