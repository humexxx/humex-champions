import { useCallback, useMemo, useState } from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Alert, Box, Tab, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { OnlineStatus } from 'src/components';

import DailyChecklist from './DailyChecklist';
import { usePlanner } from '../hooks';

const WeekDays = ({ days }: { days: Dayjs[] }) => {
  const [value, setValue] = useState(dayjs().date().toString());
  const { plannerList, error } = usePlanner();

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const planner = useCallback(
    (day: Dayjs) => {
      return plannerList?.find((x) => x.date.date() === day.date());
    },
    [plannerList]
  );

  function getCompletedTasksFormated(day: Dayjs) {
    const _planner = planner(day);
    if (!_planner?.items.length) return '- / -';
    return `${_planner.items.filter((x) => x.completed).length} / ${
      _planner.items.length
    }`;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          onChange={handleChange}
          aria-label="lab API tabs example"
          allowScrollButtonsMobile
          variant="scrollable"
        >
          {days.map((day) => (
            <Tab
              icon={
                <Typography variant="caption">
                  {getCompletedTasksFormated(day)}
                </Typography>
              }
              iconPosition="top"
              key={day.toString()}
              label={
                <Typography>
                  {dayjs().date() === day.date() && (
                    <OnlineStatus sx={{ mb: 0.5, mr: 1 }} />
                  )}
                  {day.format('dddd')}
                </Typography>
              }
              value={day.date().toString()}
            />
          ))}
        </TabList>
      </Box>
      {days.map((day) => (
        <TabPanel key={day.date()} value={day.date().toString()}>
          <DailyChecklist day={day} data={planner(day)} />
        </TabPanel>
      ))}
    </TabContext>
  );
};

export default WeekDays;
