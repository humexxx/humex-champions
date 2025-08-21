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
} from '@mui/material';

interface StandingEntry {
  idTeam: string;
  strTeam: string;
  strTeamBadge?: string;
  intRank: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm?: string;
}

interface StandingsTableProps {
  standings: StandingEntry[];
  loading?: boolean;
  error?: string;
  compact?: boolean;
}

const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  loading,
  error,
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
    return <Alert severity="error">{error}</Alert>;
  }

  // Show empty state
  if (!standings || standings.length === 0) {
    return (
      <Alert severity="info">
        No standings data available for the selected league and season.
      </Alert>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: compact ? 400 : 800,
        overflow: 'auto',
        boxShadow: 'none',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <Table
        stickyHeader
        aria-label="soccer standings table"
        size={compact ? 'small' : 'medium'}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
            <TableCell
              align="center"
              sx={{
                fontWeight: 600,
                width: 50,
                bgcolor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0',
                fontSize: compact ? '0.75rem' : '0.875rem',
              }}
            >
              #
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                minWidth: compact ? 150 : 200,
                bgcolor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0',
                fontSize: compact ? '0.75rem' : '0.875rem',
              }}
            >
              Club
            </TableCell>
            {!compact && (
              <>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 60,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  MP
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 60,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  W
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 60,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  D
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 60,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  L
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 80,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  GF
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 80,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  GA
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    width: 80,
                    bgcolor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '0.875rem',
                  }}
                >
                  GD
                </TableCell>
              </>
            )}
            <TableCell
              align="center"
              sx={{
                fontWeight: 600,
                width: 80,
                bgcolor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0',
                fontSize: compact ? '0.75rem' : '0.875rem',
              }}
            >
              Pts
            </TableCell>
            {!compact && (
              <TableCell
                sx={{
                  fontWeight: 600,
                  width: 120,
                  bgcolor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                  fontSize: '0.875rem',
                }}
              >
                Last 5
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((team) => {
            const position = parseInt(team.intRank);
            const goalDifference = parseInt(team.intGoalDifference);

            return (
              <TableRow
                key={team.idTeam}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                {/* Position */}
                <TableCell
                  align="center"
                  sx={{
                    py: compact ? 1 : 1.5,
                    borderLeft:
                      position <= 4
                        ? '3px solid #4caf50'
                        : position <= 6
                          ? '3px solid #ff9800'
                          : position >= 18
                            ? '3px solid #f44336'
                            : '3px solid transparent',
                  }}
                >
                  <Typography
                    variant={compact ? 'caption' : 'body2'}
                    fontWeight={600}
                    sx={{
                      color:
                        position <= 4
                          ? '#4caf50'
                          : position <= 6
                            ? '#ff9800'
                            : position >= 18
                              ? '#f44336'
                              : '#666',
                    }}
                  >
                    {team.intRank}
                  </Typography>
                </TableCell>

                {/* Team Name with Badge */}
                <TableCell sx={{ py: compact ? 1 : 1.5 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={compact ? 1 : 1.5}
                  >
                    {team.strTeamBadge && (
                      <Avatar
                        src={team.strTeamBadge}
                        alt={team.strTeam}
                        sx={{
                          width: compact ? 24 : 32,
                          height: compact ? 24 : 32,
                        }}
                      />
                    )}
                    <Typography
                      variant={compact ? 'body2' : 'body1'}
                      fontWeight={500}
                      sx={{
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: compact ? 120 : 180,
                      }}
                    >
                      {team.strTeam}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Stats - only show in full view */}
                {!compact && (
                  <>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {team.intPlayed}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {team.intWin}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {team.intDraw}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {team.intLoss}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {team.intGoalsFor}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {team.intGoalsAgainst}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          color:
                            goalDifference > 0
                              ? '#4caf50'
                              : goalDifference < 0
                                ? '#f44336'
                                : '#666',
                        }}
                      >
                        {goalDifference > 0 ? '+' : ''}
                        {goalDifference}
                      </Typography>
                    </TableCell>
                  </>
                )}

                {/* Points */}
                <TableCell align="center" sx={{ py: compact ? 1 : 1.5 }}>
                  <Typography
                    variant={compact ? 'body2' : 'body1'}
                    fontWeight={600}
                    sx={{ color: '#1a1a1a' }}
                  >
                    {team.intPoints}
                  </Typography>
                </TableCell>

                {/* Form - only in full view */}
                {!compact && team.strForm && (
                  <TableCell sx={{ py: 1.5 }}>
                    <Box display="flex" gap={0.5}>
                      {team.strForm
                        .split('')
                        .slice(0, 5)
                        .map((result, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor:
                                result === 'W'
                                  ? '#4caf50'
                                  : result === 'D'
                                    ? '#ff9800'
                                    : result === 'L'
                                      ? '#f44336'
                                      : '#e0e0e0',
                              color: 'white',
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              fontSize="10px"
                            >
                              {result}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StandingsTable;
