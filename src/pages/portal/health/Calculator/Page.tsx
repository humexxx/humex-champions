import { Typography } from '@mui/material';
import { PageContent, PageHeader } from 'src/components';

const Page = () => {
  return (
    <>
      <PageHeader
        title="Health Calculator"
        description="Calculate BMI, calories, and other health metrics"
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
