import { useMemo } from 'react';

import { Box, Container, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

import { PageContainer } from '../../../../components/layout';
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

const PlannerPage = () => {
  const daysOfCurrentWeek = useMemo(getDaysOfCurrentWeek, []);

  return (
    <PageContainer title="Daily Planner">
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Daily Task Planner
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto' }}
          >
            Organize your daily tasks, track progress, and build productive
            habits
          </Typography>
        </Box>

        {/* Week View */}
        <WeekDays days={daysOfCurrentWeek} />
      </Container>
    </PageContainer>
  );
};

export default PlannerPage;
