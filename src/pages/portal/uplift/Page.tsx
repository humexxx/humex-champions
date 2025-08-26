import { useMemo } from 'react';

import ChecklistIcon from '@mui/icons-material/Checklist';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { LinkOptionCard } from 'src/components';
import { PageContainer } from 'src/components/layout';
import { ROUTES } from 'src/consts';

const UpliftPage = () => {
  const options = useMemo(
    () => [
      {
        route: ROUTES.PORTAL.UPLIFT.PLANNER.split('/').at(-1) as string,
        label: 'Daily Planner',
        description: 'Organize your daily tasks with smart categorization',
        Icon: ChecklistIcon,
        color: '#1976d2',
      },
      {
        route: ROUTES.PORTAL.UPLIFT.PATHWAY.split('/').at(-1) as string,
        label: 'Growth Pathways',
        description: 'Follow structured personal development journeys',
        Icon: InsightsIcon,
        color: '#7b1fa2',
      },
      {
        route: ROUTES.PORTAL.UPLIFT.ANALYTICS.split('/').at(-1) as string,
        label: 'Progress Analytics',
        description: 'Track your habits and achievements over time',
        Icon: TrendingUpIcon,
        color: '#388e3c',
      },
    ],
    []
  );

  const features = [
    'Smart task categorization',
    'Habit streak tracking',
    'Progress insights',
    'Goal achievement',
  ];

  return (
    <PageContainer title="Personal Growth Hub">
      <Container maxWidth="lg">
        {/* Main Options Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {options.map(({ route, Icon, description, label, color }) => (
            <Grid size={{ xs: 12, md: 4 }} key={route}>
              <Box
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <LinkOptionCard
                  route={route}
                  label={label}
                  description={description}
                  icon={
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color }} />
                    </Box>
                  }
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Hero Section with Features */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 6,
            mb: 6,
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="700"
              gutterBottom
            >
              Your Journey to Excellence
            </Typography>
            <Typography
              variant="h6"
              sx={{ opacity: 0.95, maxWidth: '700px', mx: 'auto', mb: 3 }}
            >
              Build lasting habits, track meaningful progress, and achieve your
              personal development goals with our intelligent growth platform
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {features.map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Quick Stats Preview */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 4,
            border: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography
              variant="h4"
              fontWeight="600"
              gutterBottom
              sx={{ color: '#2c3e50' }}
            >
              Track Your Growth Journey
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}
            >
              Get detailed insights into your daily habits, weekly progress, and
              long-term growth trends with our comprehensive analytics dashboard
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 3,
                mt: 4,
              }}
            >
              <Box>
                <Typography variant="h3" fontWeight="700" color="primary.main">
                  0
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Tasks Completed
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="700" color="success.main">
                  0%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Success Rate
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="700" color="warning.main">
                  0
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="500"
                >
                  Day Streak
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </PageContainer>
  );
};

export default UpliftPage;
