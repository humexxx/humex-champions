import { Breadcrumbs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { PageContent, PageHeader } from 'src/components';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Form } from './components';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('uplift.title')} - Champions`);

  return (
    <>
      <PageHeader>
        <Breadcrumbs aria-label="navigator">
          <Typography
            component={Link}
            to="/client/uplift"
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
            {t('uplift.title')}
          </Typography>
          <Typography
            variant="body1"
            style={{
              viewTransitionName: 'checklist',
            }}
            color="text.primary"
          >
            <strong>{t('uplift.checklist.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>

      <PageContent>
        <Form />
      </PageContent>
    </>
  );
};

export default Page;
