import { Breadcrumbs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { PageHeader } from 'src/components';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.compound-calculator.title')} - Champions`);

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
              viewTransitionName: 'compound-calculator',
            }}
            color="text.primary"
          >
            <strong>{t('finances.compound-calculator.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>

      <>Some content here</>
    </>
  );
};

export default Page;
