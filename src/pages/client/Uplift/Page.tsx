import { Grid, Typography } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { useMemo } from 'react';
import { ButtonOptionCard, PageHeader } from 'src/components/common';
import ChecklistIcon from '@mui/icons-material/Checklist';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('uplift.title')} - Champions`);

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
            <ButtonOptionCard
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
