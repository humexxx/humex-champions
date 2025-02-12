import { useMemo } from 'react';

import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        route: 'youtube',
        label: t('entertainment.youtube.title'),
        description: t('entertainment.youtube.description'),
        Icon: YouTubeIcon,
      },

      {
        route: 'trips',
        label: t('entertainment.trips.title'),
        description: t('entertainment.trips.description'),
        Icon: ModeOfTravelIcon,
      },
    ],
    [t]
  );

  return (
    <>
      <PageHeader
        title={t('entertainment.summary')}
        description={t('entertainment.description')}
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
