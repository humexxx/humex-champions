import { Paper, Typography, Box } from '@mui/material';

interface ResultsTableProps {
  season: string;
}

const ResultsTable = ({ season }: ResultsTableProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {season} Race Results
      </Typography>

      <Box>
        <Typography color="text.secondary">
          Race results will be implemented here. Features to include:
        </Typography>
        <ul>
          <li>Completed race results with positions</li>
          <li>Lap times and fastest laps</li>
          <li>DNF (Did Not Finish) information</li>
          <li>Points awarded per race</li>
          <li>Race highlights and statistics</li>
        </ul>
      </Box>
    </Paper>
  );
};

export default ResultsTable;
