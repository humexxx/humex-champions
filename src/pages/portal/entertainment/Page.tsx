import { useMemo } from 'react';

import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SportsIcon from '@mui/icons-material/Sports';
import { Grid } from '@mui/material';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';
import { Page } from 'src/components/layout';

import { Toys } from '@mui/icons-material';
import { ROUTES } from 'src/consts';

const EntertainmentPage = () => {
  const options = useMemo(
    () => [
      {
        route: ROUTES.PORTAL.ENTERTAINMENT.F1.split('/').at(-1) as string,
        label: 'F1',
        description: 'View F1 results, news, and more',
        Icon: Toys,
      },
      {
        route: ROUTES.PORTAL.ENTERTAINMENT.SOCCER.split('/').at(-1) as string,
        label: 'Soccer',
        description: 'Live soccer standings, matches, and team information',
        Icon: SportsIcon,
      },
      {
        route: ROUTES.PORTAL.ENTERTAINMENT.YOUTUBE.split('/').at(-1) as string,
        label: 'YouTube',
        description: 'Manage your YouTube content and playlists',
        Icon: YouTubeIcon,
      },

      {
        route: ROUTES.PORTAL.ENTERTAINMENT.TRIPS.split('/').at(-1) as string,
        label: 'Trips',
        description: 'Plan and track your travel adventures',
        Icon: ModeOfTravelIcon,
      },
    ],
    []
  );

  return (
    <Page title="Entertainment">
      <PageHeader
        title="Entertainment"
        description="Manage your entertainment and leisure activities"
      />
      <PageContent>
        <Grid container spacing={4}>
          {options.map(({ route, Icon, description, label }) => (
            <Grid size={{ xs: 12, md: 4 }} key={route}>
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
    </Page>
  );
};

export default EntertainmentPage;
