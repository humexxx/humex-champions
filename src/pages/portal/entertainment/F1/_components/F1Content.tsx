import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { RaceCalendar, StandingsTable, ResultsTable } from './';

interface F1Data {
  currentSeason: string;
  nextRace: {
    name: string;
    date: string;
    circuit: string;
  };
  standings: {
    drivers: any[];
    constructors: any[];
  };
}

interface F1ContentProps {
  f1Data: F1Data | null;
  selectedTab: string;
  loading: boolean;
  error: string | null;
}

const F1Content = ({ f1Data, selectedTab, loading, error }: F1ContentProps) => {
  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // No data state
  if (!f1Data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No F1 data available</Typography>
      </Paper>
    );
  }

  // Tab content rendering
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'races':
        return <RaceCalendar season={f1Data.currentSeason} />;

      case 'standings':
        return (
          <StandingsTable
            drivers={f1Data.standings.drivers}
            constructors={f1Data.standings.constructors}
          />
        );

      case 'results':
        return <ResultsTable season={f1Data.currentSeason} />;

      default:
        return (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Select a tab to view F1 data
            </Typography>
          </Paper>
        );
    }
  };

  return <Box>{renderTabContent()}</Box>;
};

export default F1Content;
