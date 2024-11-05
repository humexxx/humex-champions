import { useMemo } from 'react';

import ChecklistIcon from '@mui/icons-material/Checklist';
import InsightsIcon from '@mui/icons-material/Insights';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LinkOptionCard, PageContent, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        route: 'planner',
        label: t('uplift.planner.title'),
        description: t('uplift.planner.description'),
        Icon: ChecklistIcon,
      },

      {
        route: 'pathway',
        label: t('uplift.pathway.title'),
        description: t('uplift.pathway.description'),
        Icon: InsightsIcon,
      },
    ],
    [t]
  );

  return (
    <>
      <PageHeader
        title={t('uplift.summary')}
        description={t('uplift.description')}
      />
      <PageContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="body2">{t('uplift.description')}</Typography>
          </Grid>
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
