import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('admin.title')} />
      <PageContent>There you fucking go</PageContent>
    </>
  );
};

export default Page;
