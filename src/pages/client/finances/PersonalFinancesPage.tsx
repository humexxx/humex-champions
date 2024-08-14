import { Breadcrumbs, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DebtCard,
  FixedExpenseCard,
  IncomeCard,
  PersonalFinancesGraph,
} from 'src/components/pages/client/finances/personal-finances';
import { PageHeader } from 'src/components/common';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDocumentMetadata } from 'src/hooks';
import { usePersonalFinances } from 'src/hooks/pages/client/finances';

const PersonalFinancesPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.personalFinances.title')} - Champions`);

  const {
    error,
    isLoading,
    personalFinances,
    updateDebts,
    updateFixedExpenses,
    updateIncomes,
  } = usePersonalFinances();

  //TODO: Implement multiple personal finances
  const { debts, fixedExpenses, incomes, id } = personalFinances[0] ?? {
    debts: [],
    fixedExpenses: [],
    incomes: [],
    id: null,
  };

  return (
    <>
      <PageHeader>
        <Breadcrumbs aria-label="navigator">
          <Typography
            component={Link}
            to="/client/finances"
            unstable_viewTransition
            style={{ textDecoration: 'none' }}
            color={'inherit'}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
            {t('finances.title')}
          </Typography>
          <Typography
            variant="body1"
            style={{
              viewTransitionName: 'personal-finances',
            }}
            color="text.primary"
          >
            <strong>{t('finances.personalFinances.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <DebtCard
            debts={debts}
            isLoading={isLoading}
            personalFinancesId={id}
            update={updateDebts}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <IncomeCard
            incomes={incomes}
            isLoading={isLoading}
            update={updateIncomes}
            personalFinancesId={id}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FixedExpenseCard
            fixedExpenses={fixedExpenses}
            isLoading={isLoading}
            update={updateFixedExpenses}
            personalFinancesId={id}
          />
        </Grid>
        <Grid item xs={12}>
          <PersonalFinancesGraph />
        </Grid>
      </Grid>
    </>
  );
};

export default PersonalFinancesPage;
