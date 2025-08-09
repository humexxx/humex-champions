import { useMemo } from 'react';

import CalculateIcon from '@mui/icons-material/Calculate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { Grid } from '@mui/material';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';

const Page = () => {
  const options = useMemo(
    () => [
      {
        route: 'training-program',
        label: 'Training Program',
        description: 'Create and track your fitness routine',
        Icon: FitnessCenterIcon,
      },

      {
        route: 'nutrition',
        label: 'Nutrition',
        description: 'Track your meals and nutrition goals',
        Icon: LocalDiningIcon,
      },
      {
        route: 'calculator',
        label: 'Health Calculator',
        description: 'Calculate BMI, calories, and other health metrics',
        Icon: CalculateIcon,
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Health & Fitness"
        description="Track your health, fitness, and nutrition goals"
      />
      <PageContent>
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
      </PageContent>
    </>
  );
};

export default Page;
