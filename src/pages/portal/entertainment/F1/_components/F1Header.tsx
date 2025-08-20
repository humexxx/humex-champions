import { Box, Typography, Stack, Tabs, Tab, Chip } from '@mui/material';
import { SportsScore, Schedule, EmojiEvents } from '@mui/icons-material';

interface F1HeaderProps {
  currentSeason: string;
  nextRace?: {
    name: string;
    date: string;
    circuit: string;
  };
  selectedTab: string;
  onTabChange: (tab: string) => void;
  loading: boolean;
}

const F1Header = ({
  currentSeason,
  nextRace,
  selectedTab,
  onTabChange,
  loading,
}: F1HeaderProps) => {
  const tabs = [
    { value: 'races', label: 'Race Calendar', icon: <Schedule /> },
    { value: 'standings', label: 'Standings', icon: <EmojiEvents /> },
    { value: 'results', label: 'Results', icon: <SportsScore /> },
  ];

  return (
    <>
      {/* Page Title */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">Formula 1 - {currentSeason}</Typography>
        {nextRace && (
          <Chip
            label={`Next: ${nextRace.name}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Box>

      {/* Next Race Info */}
      {nextRace && !loading && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 300 }}>
              {nextRace.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(nextRace.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {nextRace.circuit}
          </Typography>
        </Box>
      )}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => onTabChange(value)}
          aria-label="F1 navigation tabs"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>
    </>
  );
};

export default F1Header;
