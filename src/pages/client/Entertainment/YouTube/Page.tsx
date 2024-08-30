import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(
    `${t('entertainment.youtube.title')} - ${t('health.title')} - Champions`
  );

  return (
    <>
      <PageHeader
        title={t('entertainment.youtube.title')}
        description={t('entertainment.youtube.description')}
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
