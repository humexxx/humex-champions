import { useMemo } from 'react';

import ChecklistIcon from '@mui/icons-material/Checklist';
import InsightsIcon from '@mui/icons-material/Insights';
import { Container, Grid } from '@mui/material';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';

const Page = () => {
  const options = useMemo(
    () => [
      {
        route: 'planner',
        label: 'Planner',
        description: 'Plan and track your daily goals',
        Icon: ChecklistIcon,
      },

      {
        route: 'pathway',
        label: 'Pathway',
        description: 'Track your personal development journey',
        Icon: InsightsIcon,
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Self Development"
        description="Tools for personal growth and improvement"
      />
      <PageContent>
        <Container maxWidth="md">
          <Grid container spacing={4}>
            {options.map(({ route, Icon, description, label }) => (
              <Grid item xs={12} md={4} key={route}>
                <LinkOptionCard
                  route={route}
                  label={label}
                  description={description}
                  icon={<Icon color="primary" />}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </PageContent>
    </>
  );
};

export default Page;
