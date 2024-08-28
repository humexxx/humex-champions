import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { useMemo } from 'react';
import { ButtonOptionCard, PageContent, PageHeader } from 'src/components';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Page = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('health.title')} - Champions`);

  const options = useMemo(
    () => [
      {
        route: 'training-program',
        label: t('health.trainingProgram.title'),
        description: t('health.trainingProgram.description'),
        Icon: FitnessCenterIcon,
      },

      {
        route: 'nutrition',
        label: t('health.nutrition.title'),
        description: t('health.nutrition.description'),
        Icon: LocalDiningIcon,
      },
      {
        route: 'calculator',
        label: t('health.calculator.title'),
        description: t('health.calculator.description'),
        Icon: CalculateIcon,
      },
    ],
    [t]
  );

  return (
    <>
      <PageHeader
        title={t('health.summary')}
        description={t('health.description')}
      />
      <PageContent>
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
      </PageContent>
    </>
  );
};

export default Page;
