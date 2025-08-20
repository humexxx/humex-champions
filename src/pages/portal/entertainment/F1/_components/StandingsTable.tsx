import { Paper, Typography, Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

interface StandingsTableProps {
  drivers: any[];
  constructors: any[];
}

const StandingsTable = ({ drivers, constructors }: StandingsTableProps) => {
  const [selectedStanding, setSelectedStanding] = useState('drivers');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Championship Standings
      </Typography>

      {/* Standings Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={selectedStanding}
          onChange={(_, value) => setSelectedStanding(value)}
        >
          <Tab value="drivers" label="Drivers Championship" />
          <Tab value="constructors" label="Constructors Championship" />
        </Tabs>
      </Box>

      <Box>
        <Typography color="text.secondary">
          {selectedStanding === 'drivers' ? 'Drivers' : 'Constructors'}{' '}
          standings will be implemented here. Features to include:
        </Typography>
        <ul>
          <li>Current championship points</li>
          <li>Position changes from last race</li>
          <li>Driver/team profiles and stats</li>
          <li>Points progression charts</li>
        </ul>
      </Box>
    </Paper>
  );
};

export default StandingsTable;
