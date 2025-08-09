import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import { PageContent, PageHeader } from 'src/components';
import { ROUTES } from 'src/consts';

import { WeekDays } from './components';

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
  const daysOfCurrentWeek = useMemo(getDaysOfCurrentWeek, []);

  return (
    <>
      <PageHeader
        title={'Life Planner'}
        breadcrumb={[
          { title: 'Uplift', route: ROUTES.PORTAL.UPLIFT.INDEX },
          { title: 'Life Planner', route: 'planner' },
        ]}
        description={t('uplift.planner.description')}
      />
      <PageContent>
        <WeekDays days={daysOfCurrentWeek} />
      </PageContent>
    </>
  );
};

export default Page;
