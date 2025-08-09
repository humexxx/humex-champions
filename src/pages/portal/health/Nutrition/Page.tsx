import { Typography } from '@mui/material';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Track your meals and nutrition goals"
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
