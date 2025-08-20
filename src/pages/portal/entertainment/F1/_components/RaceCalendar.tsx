import { Paper, Typography, Box } from '@mui/material';

interface RaceCalendarProps {
  season: string;
}

const RaceCalendar = ({ season }: RaceCalendarProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {season} Race Calendar
      </Typography>

      <Box>
        <Typography color="text.secondary">
          Race calendar will be implemented here. Features to include:
        </Typography>
        <ul>
          <li>Upcoming races with dates and times</li>
          <li>Race results for completed races</li>
          <li>Circuit information and maps</li>
          <li>Session schedules (Practice, Qualifying, Race)</li>
        </ul>
      </Box>
    </Paper>
  );
};

export default RaceCalendar;
