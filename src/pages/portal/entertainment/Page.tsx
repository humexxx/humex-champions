import { useMemo } from 'react';

import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Grid } from '@mui/material';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';

const Page = () => {
  const options = useMemo(
    () => [
      {
        route: 'youtube',
        label: 'YouTube',
        description: 'Manage your YouTube content and playlists',
        Icon: YouTubeIcon,
      },

      {
        route: 'trips',
        label: 'Trips',
        description: 'Plan and track your travel adventures',
        Icon: ModeOfTravelIcon,
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Entertainment"
        description="Manage your entertainment and leisure activities"
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
