import { useMemo } from 'react';

import ChecklistIcon from '@mui/icons-material/Checklist';
import InsightsIcon from '@mui/icons-material/Insights';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LinkOptionCard, PageHeader } from 'src/components';

const Page = () => {
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        route: 'checklist',
        label: t('uplift.checklist.title'),
        description: t('uplift.checklist.description'),
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
      <PageHeader>
        <Typography variant="h6" component="h2" gutterBottom>
          <strong>{t('uplift.summary')}</strong>
        </Typography>
        <Typography variant="body1">{t('uplift.description')}</Typography>
      </PageHeader>

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
    </>
  );
};

export default Page;
