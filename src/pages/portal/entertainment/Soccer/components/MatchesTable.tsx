import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  dateEvent: string;
  strTime?: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus?: string;
  strLeague?: string;
  strSeason?: string;
  strStadium?: string;
}

interface MatchesTableProps {
  matches: Match[];
  loading?: boolean;
  error?: string;
  title?: string;
  compact?: boolean;
}

const MatchesTable: React.FC<MatchesTableProps> = ({
  matches,
  loading,
  error,
  title = 'Matches',
  compact = false,
}) => {
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
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show empty state
  if (!matches || matches.length === 0) {
    return (
      <Alert severity="info">
        No {title.toLowerCase()} available for the selected league.
      </Alert>
    );
  }

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper function to format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      // Handle time format like "15:00:00"
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Box>
      {!compact && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: compact ? 300 : 600,
          overflow: 'auto',
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <Table aria-label="matches table" size={compact ? 'small' : 'medium'}>
          {!compact && (
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  Match
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  Score
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {matches.map((match) => (
              <TableRow
                key={match.idEvent}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                {/* Date */}
                <TableCell
                  sx={{ py: compact ? 1 : 1.5, minWidth: compact ? 80 : 120 }}
                >
                  <Box>
                    <Typography
                      variant={compact ? 'caption' : 'body2'}
                      fontWeight={500}
                      sx={{ color: '#1a1a1a' }}
                    >
                      {formatDate(match.dateEvent)}
                    </Typography>
                    {match.strTime && (
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', color: 'text.secondary' }}
                      >
                        {formatTime(match.strTime)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Match */}
                <TableCell sx={{ py: compact ? 1 : 1.5 }}>
                  <Box sx={{ minWidth: compact ? 200 : 300 }}>
                    {/* Home Team */}
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      {match.strHomeTeamBadge && (
                        <Avatar
                          src={match.strHomeTeamBadge}
                          alt={match.strHomeTeam}
                          sx={{
                            width: compact ? 20 : 24,
                            height: compact ? 20 : 24,
                          }}
                        />
                      )}
                      <Typography
                        variant={compact ? 'body2' : 'body1'}
                        fontWeight={500}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: compact ? 140 : 200,
                        }}
                      >
                        {match.strHomeTeam}
                      </Typography>
                    </Box>

                    {/* Away Team */}
                    <Box display="flex" alignItems="center" gap={1}>
                      {match.strAwayTeamBadge && (
                        <Avatar
                          src={match.strAwayTeamBadge}
                          alt={match.strAwayTeam}
                          sx={{
                            width: compact ? 20 : 24,
                            height: compact ? 20 : 24,
                          }}
                        />
                      )}
                      <Typography
                        variant={compact ? 'body2' : 'body1'}
                        fontWeight={500}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: compact ? 140 : 200,
                        }}
                      >
                        {match.strAwayTeam}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Score */}
                <TableCell align="center" sx={{ py: compact ? 1 : 1.5 }}>
                  {match.intHomeScore !== undefined &&
                  match.intAwayScore !== undefined ? (
                    <Typography
                      variant={compact ? 'body2' : 'body1'}
                      fontWeight={600}
                      sx={{ color: '#1a1a1a' }}
                    >
                      {match.intHomeScore} - {match.intAwayScore}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {formatTime(match.strTime) || '-'}
                    </Typography>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell sx={{ py: compact ? 1 : 1.5 }}>
                  <Chip
                    label={match.strStatus || 'Scheduled'}
                    size={compact ? 'small' : 'medium'}
                    variant="outlined"
                    sx={{
                      fontSize: compact ? '0.7rem' : '0.75rem',
                      height: compact ? 20 : 24,
                      color:
                        match.strStatus === 'Match Finished'
                          ? '#4caf50'
                          : match.strStatus === 'Not Started'
                            ? '#1976d2'
                            : '#666',
                      borderColor:
                        match.strStatus === 'Match Finished'
                          ? '#4caf50'
                          : match.strStatus === 'Not Started'
                            ? '#1976d2'
                            : '#e0e0e0',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MatchesTable;
