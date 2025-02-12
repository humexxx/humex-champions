import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t('health.calculator.title')}
        description={t('health.calculator.description')}
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
