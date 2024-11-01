import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'src/components';

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
    <PageHeader
      breadcrumb={[
        { title: t('uplift.title'), route: '/client/uplift' },
        { title: t('uplift.planner.title'), route: 'planner' },
      ]}
      description={t('uplift.planner.description')}
    >
      <WeekDays days={daysOfCurrentWeek} />
    </PageHeader>
  );
};

export default Page;
