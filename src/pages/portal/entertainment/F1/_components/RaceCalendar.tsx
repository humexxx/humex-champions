import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { F1Service } from 'src/services/f1Service';
import {
  CalendarToday,
  EmojiEvents,
  Schedule,
  LocationOn,
} from '@mui/icons-material';

interface RaceCalendarProps {
  season: string;
}

interface RaceEvent {
  date: string;
  startDate: string;
  endDate: string;
  name: string;
  circuit: string;
  status: {
    id: string;
    state: 'pre' | 'post' | 'live';
    detail: string;
  };
  completed: boolean;
  winner: string | null;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

const getStatusColor = (status: RaceEvent['status']) => {
  switch (status.state) {
    case 'pre':
      return 'primary';
    case 'live':
      return 'error';
    case 'post':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: RaceEvent['status']) => {
  switch (status.state) {
    case 'pre':
      return <Schedule />;
    case 'live':
      return <CircularProgress size={16} />;
    case 'post':
      return <EmojiEvents />;
    default:
      return <CalendarToday />;
  }
};

const RaceCalendar = ({ season }: RaceCalendarProps) => {
  const [schedule, setSchedule] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await F1Service.getSchedule(parseInt(season))) as any;
        if (response?.success) {
          setSchedule(response.data || []);
        } else {
          setError(response?.error || 'Failed to fetch schedule');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [season]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {season} Race Calendar
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {season} Race Calendar
        </Typography>
        <Alert severity="warning">{error}</Alert>
      </Paper>
    );
  }

  const completedRaces = schedule.filter((race) => race.completed);
  const upcomingRaces = schedule.filter((race) => !race.completed);
  const nextRace = upcomingRaces[0];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {season} Race Calendar
      </Typography>

      {schedule.length === 0 ? (
        <Alert severity="info">
          No race schedule available for {season} season yet.
        </Alert>
      ) : (
        <Box>
          {/* Season Summary */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {schedule.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Races
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {completedRaces.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {upcomingRaces.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Next Race Highlight */}
          {nextRace && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🏁 Next Race
              </Typography>
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="h6" color="primary">
                        {nextRace.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {nextRace.circuit}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatDateTime(nextRace.startDate)}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(nextRace.status)}
                        label={nextRace.status.detail}
                        color={getStatusColor(nextRace.status)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Full Schedule */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            📅 Full Season Schedule
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {schedule.map((race, index) => (
              <Card
                key={race.date}
                variant="outlined"
                sx={{
                  height: '100%',
                  opacity: race.completed ? 0.8 : 1,
                  border: race === nextRace ? '2px solid' : undefined,
                  borderColor: race === nextRace ? 'primary.main' : undefined,
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    {/* Race Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Round {index + 1}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(race.status)}
                        label={race.status.state.toUpperCase()}
                        color={getStatusColor(race.status)}
                        size="small"
                      />
                    </Box>

                    {/* Race Name */}
                    <Typography
                      variant="h6"
                      sx={{ fontSize: '1rem', lineHeight: 1.2 }}
                    >
                      {race.name}
                    </Typography>

                    {/* Circuit */}
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {race.circuit}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(race.startDate)}
                      </Typography>
                    </Box>

                    {/* Winner (if completed) */}
                    {race.winner && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={<EmojiEvents />}
                          label={`Winner: ${race.winner}`}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    )}

                    {/* Race Time (if upcoming) */}
                    {!race.completed && (
                      <Typography variant="caption" color="text.secondary">
                        {race.status.detail}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RaceCalendar;
