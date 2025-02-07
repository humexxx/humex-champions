import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Page } from 'src/components/layout';

const DashboardPage = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'dashboard' });

  return (
    <Page title={t('title')} useContainer={false}>
      <Box
        component={'section'}
        sx={{
          bgcolor: 'black',
          borderRadius: {
            md: 0,
            lg: 4,
          },
          mx: {
            md: 0,
            lg: 2,
          },
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h6" component="h1" color="common.white">
            Dashboard
          </Typography>
          <Box height={300}></Box>
        </Container>
      </Box>
      <Box component={'section'}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h6" component="h1">
            Some other content
          </Typography>
          <Box height={300}></Box>
        </Container>
      </Box>
    </Page>
  );
};

export default DashboardPage;
