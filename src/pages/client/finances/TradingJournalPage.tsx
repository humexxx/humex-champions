import { Box, Breadcrumbs, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {
  EditPanel,
  SummaryPanel,
} from 'src/components/pages/client/finances/trading-journal';

const TradingJournalPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Breadcrumbs aria-label="navigator">
        <Link
          to="/client/finances"
          unstable_viewTransition
          style={{ textDecoration: 'none' }}
        >
          {t('finances.title')}
        </Link>
        <Typography
          variant="h6"
          style={{
            viewTransitionName: 'trading-journal',
          }}
        >
          {t('finances.tradingJournal.title')}
        </Typography>
      </Breadcrumbs>
      <Box mt={4}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <DateCalendar displayWeekNumber />
          </Grid>
          <Grid item xs={12} md={6}>
            <EditPanel />
          </Grid>
          <Grid item xs={12} mt={4}>
            <SummaryPanel
              amount={10}
              monthlyGrowth={10}
              percentage={10}
              trades={22}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default TradingJournalPage;
