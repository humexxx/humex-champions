import { Alert, Breadcrumbs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { GlobalLoader, PageContent, PageHeader } from 'src/components';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePortfolio } from './hooks';
import { CreatePortfolio, PortfolioView } from './components';

const Page = () => {
  const { t } = useTranslation();
  const { error, isLoading, portfolioSnapshots, initPortfolio } =
    usePortfolio();
  useDocumentMetadata(`${t('finances.portfolio.title')} - Champions`);

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <PageHeader>
        <Breadcrumbs aria-label="navigator">
          <Typography
            component={Link}
            to="/client/finances"
            unstable_viewTransition
            color={'info.main'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} color="inherit" />
            {t('finances.title')}
          </Typography>
          <Typography
            variant="body1"
            style={{
              viewTransitionName: 'portfolio',
            }}
            color="text.primary"
          >
            <strong>{t('finances.portfolio.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>

      <PageContent>
        {isLoading ? (
          <GlobalLoader />
        ) : portfolioSnapshots.length ? (
          <PortfolioView portfolioSnapshots={portfolioSnapshots} />
        ) : (
          <CreatePortfolio onSubmit={initPortfolio} pageLoading={isLoading} />
        )}
      </PageContent>
    </>
  );
};

export default Page;
