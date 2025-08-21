import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { POPULAR_SOCCER_LEAGUES } from 'src/services/soccerService';

interface LeagueSelectorProps {
  selectedLeague: string;
  selectedSeason: string;
  onLeagueChange: (leagueId: string) => void;
  onSeasonChange: (season: string) => void;
}

// League information for display
const LEAGUE_INFO = {
  [POPULAR_SOCCER_LEAGUES.PREMIER_LEAGUE]: {
    name: 'Premier League',
    country: 'England',
  },
  [POPULAR_SOCCER_LEAGUES.LA_LIGA]: { name: 'La Liga', country: 'Spain' },
  [POPULAR_SOCCER_LEAGUES.BUNDESLIGA]: {
    name: 'Bundesliga',
    country: 'Germany',
  },
  [POPULAR_SOCCER_LEAGUES.SERIE_A]: { name: 'Serie A', country: 'Italy' },
  [POPULAR_SOCCER_LEAGUES.LIGUE_1]: { name: 'Ligue 1', country: 'France' },
  [POPULAR_SOCCER_LEAGUES.CHAMPIONS_LEAGUE]: {
    name: 'Champions League',
    country: 'Europe',
  },
  [POPULAR_SOCCER_LEAGUES.EUROPA_LEAGUE]: {
    name: 'Europa League',
    country: 'Europe',
  },
  [POPULAR_SOCCER_LEAGUES.WORLD_CUP]: {
    name: 'World Cup',
    country: 'International',
  },
  [POPULAR_SOCCER_LEAGUES.EUROS]: {
    name: 'Euro Championship',
    country: 'Europe',
  },
  [POPULAR_SOCCER_LEAGUES.COPA_AMERICA]: {
    name: 'Copa America',
    country: 'South America',
  },
  [POPULAR_SOCCER_LEAGUES.MLS]: { name: 'MLS', country: 'USA' },
  [POPULAR_SOCCER_LEAGUES.BRAZILIAN_SERIE_A]: {
    name: 'Serie A',
    country: 'Brazil',
  },
  [POPULAR_SOCCER_LEAGUES.ARGENTINE_PRIMERA]: {
    name: 'Primera División',
    country: 'Argentina',
  },
} as const;

// Generate season options in YYYY-YYYY format (current season and 5 seasons back)
const generateSeasonOptions = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Determine current season start year (August = new season start)
  const currentSeasonStart = currentMonth >= 8 ? currentYear : currentYear - 1;

  const seasons = [];
  for (let i = 0; i < 6; i++) {
    const seasonStartYear = currentSeasonStart - i;
    seasons.push(`${seasonStartYear}-${seasonStartYear + 1}`);
  }
  return seasons;
};

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeague,
  selectedSeason,
  onLeagueChange,
  onSeasonChange,
}) => {
  const seasonOptions = generateSeasonOptions();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        bgcolor: '#f8f9fa',
        p: 2,
        borderRadius: 1,
      }}
    >
      {/* League Selector */}
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel id="league-select-label">League</InputLabel>
        <Select
          labelId="league-select-label"
          value={selectedLeague}
          label="League"
          onChange={(e) => onLeagueChange(e.target.value as string)}
          sx={{
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
          }}
        >
          {Object.entries(LEAGUE_INFO).map(([leagueId, info]) => (
            <MenuItem key={leagueId} value={leagueId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box>
                  <Typography variant="body2" component="div" fontWeight={500}>
                    {info.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {info.country}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Season Selector */}
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="season-select-label">Season</InputLabel>
        <Select
          labelId="season-select-label"
          value={selectedSeason}
          label="Season"
          onChange={(e) => onSeasonChange(e.target.value as string)}
          sx={{
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
          }}
        >
          {seasonOptions.map((season) => (
            <MenuItem key={season} value={season}>
              <Typography variant="body2">{season}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LeagueSelector;
