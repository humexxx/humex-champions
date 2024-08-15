import {
  Box,
  Breadcrumbs,
  Grid,
  Grow,
  IconButton,
  Tab,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { TabContext, TabList, TabPanel } from '@mui/lab';

function getTabProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const PersonalFinancesPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.personalFinances.title')} - Champions`);

  const {
    error,
    isLoading,
    personalFinances,
    addPersonalFinance,
    updateDebts,
    updateFixedExpenses,
    updateIncomes,
  } = usePersonalFinances();
  const [selectedTab, setSelectedTab] = useState('0');

  const _personalFinances = useMemo(
    () =>
      personalFinances.length
        ? personalFinances
        : [
            {
              debts: [],
              fixedExpenses: [],
              incomes: [],
              id: '',
            },
          ],
    [personalFinances]
  );

  function handleCreateNewPlan() {
    // clone the first personal finance plan
    addPersonalFinance(personalFinances[0]);
  }

  const isCreateNewPlanDisabled = useMemo(
    () =>
      !_personalFinances[0].debts.length &&
      !_personalFinances[0].fixedExpenses.length &&
      !_personalFinances[0].debts.length,
    [_personalFinances]
  );

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

      <Box mb={2}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={2}>
            <TabList
              onChange={(_, tab) => setSelectedTab(tab)}
              aria-label="personal finances ideas"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root:first-of-type': {
                  color: 'warning.main',
                },
                '& .Mui-selected:first-of-type': {
                  color: 'warning.main',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor:
                    selectedTab === '0' ? 'warning.main' : 'primary.main',
                },
              }}
            >
              {_personalFinances.map(({ id }, i) => (
                <Tab
                  key={`tab-${id}`}
                  label={!i ? 'Original' : 'Plan ' + i}
                  value={i.toString()}
                />
              ))}
              <ButtonInTabs
                tooltipText={
                  !isCreateNewPlanDisabled
                    ? t('finances.personalFinances.addPlan')
                    : t('finances.personalFinances.addPlanHint')
                }
                onClick={handleCreateNewPlan}
                disabled={isCreateNewPlanDisabled || isLoading}
              />
            </TabList>
          </Box>
          {_personalFinances.map(({ id, debts, fixedExpenses, incomes }, i) => (
            <Grow
              key={`tab-panel-${id}`}
              in={selectedTab === i.toString()}
              timeout={250}
              mountOnEnter
              unmountOnExit
            >
              <TabPanel value={i.toString()} sx={{ p: 0 }}>
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
                </Grid>
              </TabPanel>
            </Grow>
          ))}
        </TabContext>
      </Box>

      <Grid container>
        <Grid item xs={12}>
          <PersonalFinancesGraph />
        </Grid>
      </Grid>
    </>
  );
};

function ButtonInTabs({
  onClick,
  tooltipText,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltipText: string;
}) {
  return (
    <Box>
      <Tooltip title={tooltipText}>
        <Box sx={{ display: 'inline-block' }}>
          <IconButton color="primary" onClick={onClick} disabled={disabled}>
            <AddIcon />
          </IconButton>
        </Box>
      </Tooltip>
    </Box>
  );
}

export default PersonalFinancesPage;
