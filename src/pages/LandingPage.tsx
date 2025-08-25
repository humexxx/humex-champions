import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
// Imágenes libres de Unsplash para ilustrar la landing
const heroImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const benefitImage =
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80';

import {
  ArrowForward as ArrowForwardIcon,
  SportsEsports as EntertainmentIcon,
  TrendingUp as FinanceIcon,
  FitnessCenter as HealthIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  Psychology as UpliftIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from 'src/consts';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FinanceIcon />,
      title: 'Smart Financial Management',
      description:
        'Track your portfolio, manage personal finances, and analyze your trading journal with AI-powered insights.',
      color: '#1976d2',
    },
    {
      icon: <HealthIcon />,
      title: 'Health & Wellness Hub',
      description:
        'Monitor your fitness journey with comprehensive health calculators and personalized training programs.',
      color: '#2e7d32',
    },
    {
      icon: <UpliftIcon />,
      title: 'Personal Development',
      description:
        'Build better habits with our uplift tools: pathway planning, daily checklists, and progress analytics.',
      color: '#ed6c02',
    },
    {
      icon: <EntertainmentIcon />,
      title: 'Healthy Entertainment & Growth',
      description:
        'Enjoy healthy entertainment: follow your favorite sports, discover new content, and listen to growth podcasts—all in one place.',
      color: '#9c27b0',
    },
  ];

  const testimonials = [
    {
      name: 'Jeff B.',
      role: 'President of Amazon',
      avatar: 'JB',
      comment:
        'This is a totally real testimonial. I built Amazon thanks to HumexChampions!',
      rating: 5,
    },
    {
      name: 'Elon M.',
      role: 'Rocket Enthusiast',
      avatar: 'EM',
      comment:
        'I was going to Mars, but then I found HumexChampions and decided to stay on Earth a bit longer.',
      rating: 5,
    },
    {
      name: 'Ada L.',
      role: 'First Programmer',
      avatar: 'AL',
      comment:
        'If only I had HumexChampions in the 1800s, I would have invented the internet too!',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
          }}
        >
          <img
            src="/favicon.svg"
            alt="Logo"
            style={{ width: 36, height: 36 }}
          />
          Champions
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            component={Link}
            to={ROUTES.AUTH.SIGN_IN}
            sx={{ color: 'text.primary' }}
          >
            Sign In
          </Button>
          <Button
            variant="contained"
            component={Link}
            to={ROUTES.AUTH.SIGN_UP}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* Hero Section estilo Gmail */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  style={{ width: 36, height: 36, marginRight: 8 }}
                />
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  Champions
                </Typography>
              </Box>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                #1 productivity and growth platform
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                Smart, secure, and easy to use. Empower your life and business
                with integrated tools for finance, health, and personal
                development.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(ROUTES.AUTH.SIGN_UP)}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  boxShadow: 2,
                  mb: 3,
                }}
              >
                Get started now
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Avatar
                src="https://randomuser.me/api/portraits/women/44.jpg"
                sx={{
                  width: 36,
                  height: 36,
                  border: '2px solid white',
                  boxShadow: 1,
                }}
              />
              <Avatar
                src="https://randomuser.me/api/portraits/men/32.jpg"
                sx={{
                  width: 36,
                  height: 36,
                  border: '2px solid white',
                  boxShadow: 1,
                  ml: -1.5,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Trusted by thousands of users
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 520,
                minHeight: 340,
                borderRadius: 5,
                boxShadow: 4,
                bgcolor: 'background.paper',
                p: 3,
                mx: 'auto',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Simulación de interfaz tipo Gmail */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    mr: 1,
                  }}
                />
                <Box
                  sx={{
                    flex: 1,
                    height: 16,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: 'grey.300',
                    borderRadius: '50%',
                    ml: 1,
                  }}
                />
              </Box>
              <Box
                sx={{
                  height: 32,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  mb: 2,
                  width: '60%',
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  }}
                />
                <Box
                  sx={{
                    flex: 1,
                    height: 48,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                />
              </Box>
              <Box
                sx={{
                  height: 16,
                  bgcolor: 'grey.200',
                  borderRadius: 2,
                  mb: 1,
                  width: '80%',
                }}
              />
              <Box
                sx={{
                  height: 16,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  mb: 1,
                  width: '70%',
                }}
              />
              <Box
                sx={{
                  height: 16,
                  bgcolor: 'grey.200',
                  borderRadius: 2,
                  mb: 1,
                  width: '90%',
                }}
              />
              <Box
                sx={{
                  height: 16,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  mb: 1,
                  width: '60%',
                }}
              />
              {/* Icono de seguridad */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -24,
                  right: -24,
                  bgcolor: 'white',
                  borderRadius: '50%',
                  boxShadow: 2,
                  width: 56,
                  height: 56,
                  p: 1,
                }}
              >
                <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), py: 16 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ mb: 2, fontWeight: 400, color: 'text.primary' }}
          >
            Everything you need to excel in life
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 6, fontWeight: 300, color: 'text.secondary' }}
          >
            Powerful tools designed to help you grow financially, physically,
            and personally
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    '&:hover': {
                      boxShadow: theme.shadows[1],
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: alpha(feature.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{ color: feature.color, '& svg': { fontSize: 28 } }}
                      >
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), py: 16 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 400, color: 'text.primary' }}
          >
            Loved by thousands of users
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{ color: '#ffc107', fontSize: 20 }}
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        flex: 1,
                      }}
                    >
                      "{testimonial.comment}"
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {testimonial.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                          >
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 16 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 16,
            px: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{ mb: 3, fontWeight: 400, color: 'text.primary' }}
          >
            Ready to become a champion?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: 300,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of users who are already using HumexChampions to
            transform their lives. Start your journey today with our free plan.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(ROUTES.AUTH.SIGN_UP)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.primary',
                }}
              >
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  style={{ width: 36, height: 36 }}
                />
                Champions
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Empowering individuals to achieve excellence in finance, health,
                and personal development.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={4}
                justifyContent="space-around"
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Product
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Financial Tools
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Health Tracking
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Personal Development
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Company
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      About Us
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Privacy Policy
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Terms of Service
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Support
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Help Center
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Contact Us
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Community
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 4,
              pt: 4,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} HumexChampions. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
