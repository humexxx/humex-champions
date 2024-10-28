import { useMemo } from 'react';

import { Alert, Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'src/components';

import { DailyChecklist } from './components';
import { usePlanner } from './hooks';

function getDaysOfCurrentWeek(): Dayjs[] {
  const today = dayjs();
  const startOfWeek = today.startOf('week');

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.add(i, 'day'));
  }

  return days;
}

const Page = () => {
  const { t } = useTranslation();
  const { plannerList, error } = usePlanner();

  const daysOfCurrentWeek = useMemo(getDaysOfCurrentWeek, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <PageHeader
      breadcrumb={[
        { title: t('uplift.title'), route: '/client/uplift' },
        { title: t('uplift.planner.title'), route: 'planner' },
      ]}
      description={t('uplift.planner.description')}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(7, 1fr)',
          },
          gap: 2,
        }}
      >
        {daysOfCurrentWeek.map((day) => (
          <Box key={day.date()}>
            <DailyChecklist
              day={day}
              data={plannerList?.find((x) => x.date.date() === day.date())}
            />
          </Box>
        ))}
      </Box>
    </PageHeader>
  );
};

export default Page;
