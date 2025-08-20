import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface ResultsTableProps {
  season: string;
}

interface RaceResult {
  position: string;
  points: string;
  driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
  grid: string;
  laps: string;
  status: string;
  time?: {
    time: string;
  };
  fastestLap?: {
    rank: string;
    time: {
      time: string;
    };
  };
}

const getCountryFlag = (nationality: string): string => {
  const flagMap: Record<string, string> = {
    British: '🇬🇧',
    Dutch: '🇳🇱',
    Monégasque: '🇲🇨',
    Spanish: '🇪🇸',
    Mexican: '🇲🇽',
    German: '🇩🇪',
    Canadian: '🇨🇦',
    Australian: '🇦🇺',
    Japanese: '🇯🇵',
    French: '🇫🇷',
    Danish: '🇩🇰',
    Thai: '🇹🇭',
    Chinese: '🇨🇳',
    Finnish: '🇫🇮',
    American: '🇺🇸',
    Argentine: '🇦🇷',
    Swiss: '🇨🇭',
    Austrian: '🇦🇹',
    Italian: '🇮🇹',
    Brazilian: '🇧🇷',
  };
  return flagMap[nationality] || '🏁';
};

const getPositionColor = (position: string): string => {
  const pos = parseInt(position);
  if (pos === 1) return '#FFD700'; // Gold
  if (pos === 2) return '#C0C0C0'; // Silver
  if (pos === 3) return '#CD7F32'; // Bronze
  if (pos <= 10) return '#90EE90'; // Light green for points
  return 'transparent';
};

const ResultsTable = ({ season }: ResultsTableProps) => {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        // For now, we'll show a placeholder until we have race-specific results
        // This would typically call F1Service.getRaceResults(season, raceId)
        setRaceResults([]);
        setError(
          'Race results feature is being developed. Please check back soon.'
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [season]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {season} Race Results
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
          {season} Race Results
        </Typography>
        <Alert severity="info">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {season} Race Results
      </Typography>

      {raceResults.length === 0 ? (
        <Alert severity="info">
          No race results available yet. This feature will display detailed race
          results including positions, lap times, and fastest laps.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Pos</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Grid</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Laps</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time/Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {raceResults.map((result, index) => (
                <TableRow
                  key={`${result.driver.driverId}-${index}`}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    backgroundColor: getPositionColor(result.position),
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {result.position}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
                      >
                        {result.driver.code}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {getCountryFlag(result.driver.nationality)}{' '}
                          {result.driver.givenName} {result.driver.familyName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {result.constructor.name}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{result.grid}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{result.laps}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {result.time?.time || result.status}
                    </Typography>
                    {result.fastestLap && (
                      <Chip
                        label={`FL: ${result.fastestLap.time.time}`}
                        size="small"
                        color="secondary"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {result.points}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default ResultsTable;
