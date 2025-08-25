import { useMemo, useState } from 'react';

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RouteIcon from '@mui/icons-material/Route';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Typography,
} from '@mui/material';
import { EPathwayDifficulty } from '@shared/models/uplift';
import { PageContent, PageHeader } from 'src/components';
import { PageContainer } from 'src/components/layout';
import { ROUTES } from 'src/consts';
import { useUpliftService } from 'src/services/upliftService';

const PathwayPage = () => {
  const upliftService = useUpliftService();
  const [pathways] = useState([]); // TODO: Load from service

  const pathwayTemplates = useMemo(
    () => upliftService.getPathwayTemplates(),
    [upliftService]
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FitnessCenter':
        return <FitnessCenterIcon />;
      case 'SelfImprovement':
        return <SelfImprovementIcon />;
      case 'Restaurant':
        return <RestaurantIcon />;
      default:
        return <RouteIcon />;
    }
  };

  return (
    <PageContainer title="Growth Pathways">
      <PageHeader
        title="Growth Pathways"
        navigator={{
          breadcrumb: [
            {
              title: 'Growth Pathways',
              route: ROUTES.PORTAL.UPLIFT.PATHWAY.split('/').pop()!,
            },
          ],
          link: {
            title: 'Uplift',
            route: ROUTES.PORTAL.UPLIFT.INDEX,
          },
        }}
      />

      <PageContent>
        <Container maxWidth="xl">
          {/* Hero Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              color: 'white',
              p: 6,
              mb: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Your Growth Journey
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Choose a pathway that aligns with your personal development goals
            </Typography>
          </Box>

          {/* Pathway Templates */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 3,
              mb: 6,
            }}
          >
            {pathwayTemplates.map((template) => (
              <Card
                key={template.id}
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: template.color || 'primary.main',
                        mr: 2,
                        width: 56,
                        height: 56,
                      }}
                    >
                      {getIcon(template.icon)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {template.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={template.difficulty}
                          size="small"
                          color={
                            template.difficulty === EPathwayDifficulty.BEGINNER
                              ? 'success'
                              : template.difficulty ===
                                  EPathwayDifficulty.INTERMEDIATE
                                ? 'warning'
                                : 'error'
                          }
                        />
                        <Chip
                          label={`${template.estimatedDuration} weeks`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {template.description}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Category: {template.category}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Goals: {template.goals.length} objectives
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      // TODO: Start pathway
                      console.log('Starting pathway:', template.id);
                    }}
                  >
                    Start Journey
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Current Pathways */}
          {pathways.length > 0 && (
            <Box>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Your Active Pathways
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {pathways.map((pathway: any) => (
                  <Card key={pathway.id} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {pathway.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Progress: {pathway.progress}% Complete
                      </Typography>
                      <Button variant="outlined" size="small">
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </PageContent>
    </PageContainer>
  );
};

export default PathwayPage;
