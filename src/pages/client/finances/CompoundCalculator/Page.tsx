import { Breadcrumbs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CompoundCalculator = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumbs aria-label="navigator">
        <Link
          to="/client/finances"
          unstable_viewTransition
          style={{ textDecoration: 'none' }}
        >
          {t('finances.title')}
        </Link>
        <Typography
          variant="h6"
          style={{
            viewTransitionName: 'compound-calculator',
          }}
        >
          {t('finances.compound-calculator.title')}
        </Typography>
      </Breadcrumbs>
    </>
  );
};

export default CompoundCalculator;
