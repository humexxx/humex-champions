import { Typography } from '@mui/material';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  return (
    <>
      <PageHeader
        title="Trips"
        description="Plan and track your travel adventures"
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
