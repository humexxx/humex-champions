import { Breadcrumbs, Grid, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DebtCard,
  IDebt,
  FixedExpenseCard,
  IFixedExpense,
  IncomeCard,
  IIncome,
  PersonalFinancesGraph,
} from 'src/components/pages/client/finances/personal-finances';
import {
  fetchDebtData,
  fetchIncomeData,
  fetchFixedExpenseData,
} from 'src/mock/finances';
import { PageHeader } from 'src/components/common';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PersonalFinancesPage = () => {
  const { t } = useTranslation();
  const [debts, setDebts] = useState<IDebt[][] | null>(null);
  const [incomes, setIncomes] = useState<IIncome[][] | null>(null);
  const [expenses, setExpenses] = useState<IFixedExpense[][] | null>(null);

  useEffect(() => {
    fetchDebtData().then((data) => setDebts(data));
    fetchIncomeData().then((data) => setIncomes(data));
    fetchFixedExpenseData().then((data) => setExpenses(data));
  }, []);

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
          {Boolean(debts) && <DebtCard debts={debts![0]} />}
        </Grid>
        <Grid item xs={12} md={4}>
          {Boolean(incomes) && <IncomeCard incomes={incomes![0]} />}
        </Grid>
        <Grid item xs={12} md={4}>
          {Boolean(expenses) && <FixedExpenseCard expenses={expenses![0]} />}
        </Grid>
        <Grid item xs={12}>
          <PersonalFinancesGraph />
        </Grid>
      </Grid>
    </>
  );
};

export default PersonalFinancesPage;
