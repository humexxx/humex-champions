import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(
    `${t('entertainment.trips.title')} - ${t('health.title')} - Champions`
  );

  return (
    <>
      <PageHeader
        title={t('entertainment.trips.title')}
        description={t('entertainment.trips.description')}
      />
      <PageContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Under construction
        </Typography>
      </PageContent>
    </>
  );
};

export default Page;
