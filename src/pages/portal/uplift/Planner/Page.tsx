import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const daysOfCurrentWeek = useMemo(getDaysOfCurrentWeek, []);

  return (
    <>
      <PageHeader
        title={t('uplift.planner.title')}
        breadcrumb={[
          { title: t('uplift.title'), route: ROUTES.PORTAL.UPLIFT.INDEX },
          { title: t('uplift.planner.title'), route: 'planner' },
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
