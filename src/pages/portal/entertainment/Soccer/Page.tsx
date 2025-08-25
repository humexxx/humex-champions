import {
  EmojiEvents,
  History,
  People,
  Schedule,
  Sports,
  Stadium,
  TrendingUp,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useDocumentMetadata from 'src/hooks/useDocumentMetadata';
import {
  POPULAR_SOCCER_LEAGUES,
  SoccerPageData,
  SoccerService,
} from 'src/services/soccerService';
import {
  LeagueSelector,
  MatchesTable,
  StandingsTable,
  TeamsTable,
} from './components';

/**
 * Soccer Page Component
 * Displays soccer data including standings, teams, matches, and player information
 * Follows the F1 page pattern but adapted for soccer-specific data
 */
const SoccerPage: React.FC = () => {
  // Tab management
  const [selectedTab, setSelectedTab] = useState(0);

  // Match type filter for matches tab
  const [matchType, setMatchType] = useState<'upcoming' | 'past'>('upcoming');

  // Data management
  const [pageData, setPageData] = useState<SoccerPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // League management
  const [selectedLeague, setSelectedLeague] = useState<string>(
    POPULAR_SOCCER_LEAGUES.PREMIER_LEAGUE
  );

  // Generate proper season format (YYYY-YYYY) for soccer leagues
  const getCurrentSeason = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const seasonStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    return `${seasonStartYear}-${seasonStartYear + 1}`;
  };

  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());

  // League information for display
  const getLeagueInfo = (leagueId: string) => {
    const leagueMap = {
      [POPULAR_SOCCER_LEAGUES.PREMIER_LEAGUE]: {
        name: 'Premier League',
        country: 'England',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
      },
      [POPULAR_SOCCER_LEAGUES.LA_LIGA]: {
        name: 'La Liga',
        country: 'Spain',
        logo: 'https://logoeps.com/wp-content/uploads/2013/03/la-liga-vector-logo.png',
      },
      [POPULAR_SOCCER_LEAGUES.BUNDESLIGA]: {
        name: 'Bundesliga',
        country: 'Germany',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png',
      },
      [POPULAR_SOCCER_LEAGUES.SERIE_A]: {
        name: 'Serie A',
        country: 'Italy',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png',
      },
      [POPULAR_SOCCER_LEAGUES.LIGUE_1]: {
        name: 'Ligue 1',
        country: 'France',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png',
      },
    };

    return (
      leagueMap[leagueId as keyof typeof leagueMap] || {
        name: 'Soccer League',
        country: 'International',
        logo: '',
      }
    );
  };

  // Set document metadata
  useDocumentMetadata('Soccer - Entertainment Portal', [
    {
      name: 'description',
      content:
        'Live soccer standings, matches, teams, and player information from major leagues worldwide',
    },
  ]);

  // Load soccer data
  const loadSoccerData = async (
    leagueId: string = selectedLeague,
    season: string = selectedSeason
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data = await SoccerService.getSoccerPageData(leagueId, season);
      setPageData(data as SoccerPageData);
    } catch (err) {
      console.error('Error loading soccer data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load soccer data'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when league/season changes
  useEffect(() => {
    loadSoccerData(selectedLeague, selectedSeason);
  }, [selectedLeague, selectedSeason]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Handle league change
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
  };

  // Handle season change
  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" justifyContent="center">
          <button onClick={() => loadSoccerData()}>Retry</button>
        </Box>
      </Container>
    );
  }

  // Render main content
  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 0 }}>
        {/* Google-style Header */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            mb: 2,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* League Header */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={getLeagueInfo(selectedLeague).logo}
                sx={{ width: 48, height: 48 }}
              >
                <Sports />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {getLeagueInfo(selectedLeague).name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getLeagueInfo(selectedLeague).country}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  label={`${selectedSeason} Season`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {/* Google-style Navigation Tabs */}
          <Box sx={{ px: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="soccer navigation tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minHeight: 48,
                  color: '#5f6368',
                  '&.Mui-selected': {
                    color: '#1976d2',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                  height: 3,
                },
              }}
            >
              <Tab
                label="Overview"
                icon={<Stadium sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Matches"
                icon={<Sports sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Standings"
                icon={<EmojiEvents sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Stats"
                icon={<TrendingUp sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                label="Teams"
                icon={<People sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Box>

        {/* League and Season Selector */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ py: 2 }}>
            <LeagueSelector
              selectedLeague={selectedLeague}
              selectedSeason={selectedSeason}
              onLeagueChange={handleLeagueChange}
              onSeasonChange={handleSeasonChange}
            />
          </CardContent>
        </Card>

        {/* Tab Content */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            {selectedTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Standings (Top 5)
                    </Typography>
                    <StandingsTable
                      standings={(pageData?.standings?.data || []).slice(0, 5)}
                      loading={loading}
                      error={
                        pageData?.standings?.success === false
                          ? 'Failed to load standings'
                          : undefined
                      }
                      compact={true}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Upcoming Matches
                    </Typography>
                    <MatchesTable
                      matches={(pageData?.nextMatches?.data || []).slice(0, 5)}
                      loading={loading}
                      error={
                        pageData?.nextMatches?.success === false
                          ? 'Failed to load matches'
                          : undefined
                      }
                      compact={true}
                      title="Upcoming"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Recent Results
                    </Typography>
                    <MatchesTable
                      matches={(pageData?.previousMatches?.data || []).slice(
                        0,
                        5
                      )}
                      loading={loading}
                      error={
                        pageData?.previousMatches?.success === false
                          ? 'Failed to load past matches'
                          : undefined
                      }
                      compact={true}
                      title="Recent"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {selectedTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Matches
                  </Typography>
                  <ToggleButtonGroup
                    value={matchType}
                    exclusive
                    onChange={(_, newMatchType) => {
                      if (newMatchType !== null) {
                        setMatchType(newMatchType);
                      }
                    }}
                    aria-label="match type"
                    size="small"
                  >
                    <ToggleButton
                      value="upcoming"
                      aria-label="upcoming matches"
                    >
                      <Schedule sx={{ mr: 1, fontSize: 18 }} />
                      Upcoming
                    </ToggleButton>
                    <ToggleButton value="past" aria-label="past matches">
                      <History sx={{ mr: 1, fontSize: 18 }} />
                      Results
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {matchType === 'upcoming' ? (
                  <MatchesTable
                    matches={pageData?.nextMatches?.data || []}
                    loading={loading}
                    error={
                      pageData?.nextMatches?.success === false
                        ? 'Failed to load upcoming matches'
                        : undefined
                    }
                    title="Upcoming Matches"
                  />
                ) : (
                  <MatchesTable
                    matches={pageData?.previousMatches?.data || []}
                    loading={loading}
                    error={
                      pageData?.previousMatches?.success === false
                        ? 'Failed to load past matches'
                        : undefined
                    }
                    title="Recent Results"
                  />
                )}
              </Box>
            )}

            {selectedTab === 2 && (
              <Box sx={{ p: 3 }}>
                <StandingsTable
                  standings={pageData?.standings?.data || []}
                  loading={loading}
                  error={
                    pageData?.standings?.success === false
                      ? 'Failed to load standings'
                      : undefined
                  }
                />
              </Box>
            )}

            {selectedTab === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  League Statistics
                </Typography>
                <Typography color="text.secondary">
                  Statistics and analytics coming soon...
                </Typography>
              </Box>
            )}

            {selectedTab === 4 && (
              <Box sx={{ p: 3 }}>
                <TeamsTable
                  teams={pageData?.teams?.data || []}
                  loading={loading}
                  error={
                    pageData?.teams?.success === false
                      ? 'Failed to load teams'
                      : undefined
                  }
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Data Source Attribution */}
        <Box sx={{ mt: 2, py: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Data provided by TheSportsDB.com API
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SoccerPage;
