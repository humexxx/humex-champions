import { useEffect, useState } from 'react';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { IDailyStats, IOverallStats } from '@shared/types/uplift';
import { PageContainer } from 'src/components/layout';
import { useUpliftService } from 'src/services/upliftService';

const AnalyticsPage = () => {
  const upliftService = useUpliftService();
  const [dailyStats, setDailyStats] = useState<IDailyStats | null>(null);
  const [overallStats, setOverallStats] = useState<IOverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [daily, overall] = await Promise.all([
          upliftService.getDailyStats(),
          upliftService.getOverallStats(),
        ]);
        setDailyStats(daily);
        setOverallStats(overall);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [upliftService]);

  return (
    <PageContainer title="Progress Analytics">
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Your Progress Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto' }}
          >
            Get insights into your daily habits, track your streaks, and monitor
            your personal growth journey
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
            }}
          >
            {/* Today's Stats */}
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="600">
                    Today's Progress
                  </Typography>
                </Box>

                {dailyStats ? (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {Math.round(dailyStats.completionRate)}%
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {dailyStats.completedTasks} of {dailyStats.totalTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          tasks completed
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Task Categories:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(dailyStats.categoryBreakdown).map(
                        ([category, count]) => (
                          <Chip
                            key={category}
                            label={`${category}: ${count}`}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No data available for today
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Overall Stats */}
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 2, color: 'success.main' }} />
                  <Typography variant="h6" fontWeight="600">
                    Overall Performance
                  </Typography>
                </Box>

                {overallStats ? (
                  <Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {overallStats.productivityScore}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Productivity
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="warning.main"
                        >
                          {overallStats.consistencyScore}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Consistency
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {overallStats.growthScore}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Growth
                        </Typography>
                      </Box>
                    </Box>

                    {overallStats.recommendations.length > 0 && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Recommendations:
                        </Typography>
                        {overallStats.recommendations.slice(0, 2).map((rec) => (
                          <Box key={rec.id} sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="500">
                              {rec.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {rec.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No overall stats available yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>
    </PageContainer>
  );
};

export default AnalyticsPage;
