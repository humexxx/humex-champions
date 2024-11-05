import { useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Alert, Box, Grid, Tab } from '@mui/material';
import {
  IDebt,
  IFinancialPlan,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';
import ButtonInTabs from 'src/components/ButtonInTabs';

import {
  DebtCard,
  FixedExpenseCard,
  IncomeCard,
  ValidateMainFinantialSnapshotDialog,
} from './components';
import { useFinancialPlans } from './hooks';

const DEFAULT_FINANCIAL_PLAN: IFinancialPlan<Dayjs> = {
  name: 'Main',
  fixedExpenses: [],
  incomes: [],
  financialSnapshots: [
    {
      debts: [],
      date: dayjs(),
      reviewed: true,
      surplus: 0,
    },
  ],
  id: null,
};

function getTabProps(id: string) {
  return {
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  };
}

const PersonalFinancesPage = () => {
  const { t } = useTranslation();

  const { data: financialPlans, error, loading, set } = useFinancialPlans();
  const [selectedTab, setSelectedTab] = useState('0');

  const _financialPlans: IFinancialPlan<Dayjs>[] = useMemo(
    () => (financialPlans?.length ? financialPlans : [DEFAULT_FINANCIAL_PLAN]),
    [financialPlans]
  );

  function handleCreateNewPlan() {
    // clone the first personal finance plan
    // maybe open a modal later
    set({
      ..._financialPlans[0],
      id: '',
      name: `Plan ${_financialPlans.length + 1}`,
    });
  }

  const isCreateNewPlanDisabled = useMemo(
    () =>
      !_financialPlans[0].financialSnapshots.at(-1)?.debts.length &&
      !_financialPlans[0].fixedExpenses.length &&
      !_financialPlans[0].incomes.length,
    [_financialPlans]
  );

  function _updateFinancialPlan(
    planId: string | null,
    data: IDebt<Dayjs>[] | IIncome<Dayjs>[] | IFixedExpense<Dayjs>[],
    key: 'debts' | 'incomes' | 'fixedExpenses'
  ) {
    let plan = planId
      ? DEFAULT_FINANCIAL_PLAN
      : _financialPlans.find((p) => p.id === planId)!;
    plan = {
      ...plan,
      ...(key === 'incomes' || key === 'fixedExpenses' ? { [key]: data } : {}),
      financialSnapshots: plan.financialSnapshots.map((snapshot, i) => {
        if (i === plan!.financialSnapshots.length - 1) {
          return {
            ...snapshot,
            ...(key === 'debts' ? { debts: data as IDebt<Dayjs>[] } : {}),
            reviewed: true,
          };
        }
        return snapshot;
      }),
    };
    set(plan);
  }

  function _updateDebts(planId: string | null, data: IDebt<Dayjs>[]) {
    if (!planId) _updateFinancialPlan(planId, data, 'debts');
    else {
      _financialPlans.forEach((plan) => {
        _updateFinancialPlan(plan.id!, data, 'debts');
      });
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <ValidateMainFinantialSnapshotDialog
        financialPlan={_financialPlans[0]}
        onSubmit={(data) => _updateDebts(_financialPlans[0].id!, data)}
      />
      <PageHeader
        title={t('finances.title')}
        breadcrumb={[
          { title: t('finances.title'), route: '/client/finances' },
          {
            title: t('finances.personalFinances.title'),
            route: 'personal-finances',
          },
        ]}
      />
      <PageContent>
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
                {_financialPlans.map(({ id, name }, i) => (
                  <Tab
                    key={`tab-${id}`}
                    label={name}
                    value={i.toString()}
                    {...getTabProps(id ?? '')}
                  />
                ))}
                <ButtonInTabs
                  tooltipText={
                    !isCreateNewPlanDisabled
                      ? t('finances.personalFinances.addPlan')
                      : t('finances.personalFinances.addPlanHint')
                  }
                  onClick={handleCreateNewPlan}
                  disabled={isCreateNewPlanDisabled || loading}
                  icon={<AddIcon />}
                />
              </TabList>
            </Box>

            {_financialPlans.map(
              ({ id, fixedExpenses, incomes, financialSnapshots }, i) => {
                const { debts } =
                  financialSnapshots[financialSnapshots.length - 1];

                return (
                  <TabPanel
                    key={`tab-panel-${id}`}
                    value={i.toString()}
                    sx={{ p: 2 }}
                  >
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={4}>
                        <DebtCard
                          canEdit={i === 0}
                          debts={debts}
                          isLoading={loading}
                          update={(data) => _updateDebts(id ?? null, data)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <IncomeCard
                          incomes={incomes}
                          isLoading={loading}
                          update={(data) =>
                            _updateFinancialPlan(id ?? null, data, 'incomes')
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FixedExpenseCard
                          fixedExpenses={fixedExpenses}
                          debts={debts}
                          isLoading={loading}
                          update={(data) =>
                            _updateFinancialPlan(
                              id ?? null,
                              data,
                              'fixedExpenses'
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>
                );
              }
            )}
          </TabContext>
        </Box>

        {/* <Grid container>
          <Grid item xs={12}>
            <PersonalFinancesGraph
              loading={isLoading}
              financialPlans={financialPlans}
            />
          </Grid>
        </Grid> */}
      </PageContent>
    </>
  );
};

export default PersonalFinancesPage;
