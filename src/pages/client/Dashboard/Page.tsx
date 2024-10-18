import { Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';
import { useAuth } from 'src/context/auth';
import { createEvent } from 'src/services/calendar';

import {
  DenseAnalyticCard,
  UniqueVisitorCard,
  IncomeOverviewCard,
} from './components';
import { useUserSettings } from '../Settings/hooks';

const Page = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'dashboard' });
  const { settings } = useUserSettings();
  const user = useAuth();

  function generateTestEvent() {
    if (!user.token) return;
    const token = localStorage.getItem('token') as string;

    createEvent(token);
  }

  return (
    <>
      <PageHeader title={t('title')} />

      <PageContent>
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {settings?.useGoogleCalendar && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateTestEvent}
              >
                Crear evento
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <DenseAnalyticCard
              title={t('totalSavings')}
              count="4,42,236"
              percentage={10.3}
              extra="442,000"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <DenseAnalyticCard
              title={t('totalFatBurn')}
              count="10,500"
              percentage={70.5}
              extra="8,900"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <DenseAnalyticCard
              title={t('totalDailyGoalsStreak')}
              count="5"
              percentage={27.4}
              extra="1,943"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <DenseAnalyticCard
              title={t('totalPLTrading')}
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
      </PageContent>
    </>
  );
};

export default Page;
