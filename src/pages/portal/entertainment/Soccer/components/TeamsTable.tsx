import React from 'react';
import {
  Paper,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';

interface Team {
  idTeam: string;
  strTeam: string;
  strTeamBadge?: string;
  strLeague?: string;
  strCountry?: string;
  intFormedYear?: string;
  strStadium?: string;
  strStadiumThumb?: string;
  strWebsite?: string;
  strDescriptionEN?: string;
}

interface TeamsTableProps {
  teams: Team[];
  loading?: boolean;
  error?: string;
}

const TeamsTable: React.FC<TeamsTableProps> = ({ teams, loading, error }) => {
  // Show loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Show empty state
  if (!teams || teams.length === 0) {
    return (
      <Alert severity="info">
        No teams data available for the selected league.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        Teams
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {teams.map((team) => (
          <Paper
            key={team.idTeam}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              {team.strTeamBadge && (
                <Avatar
                  src={team.strTeamBadge}
                  alt={team.strTeam}
                  sx={{ width: 40, height: 40 }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {team.strTeam}
                </Typography>
                {team.strCountry && (
                  <Typography variant="caption" color="text.secondary">
                    {team.strCountry}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              {team.intFormedYear && (
                <Chip
                  label={`Founded ${team.intFormedYear}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1, fontSize: '0.7rem' }}
                />
              )}
              {team.strStadium && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  🏟️ {team.strStadium}
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default TeamsTable;
