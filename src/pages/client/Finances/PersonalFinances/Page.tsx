import { useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Breadcrumbs, Grid, Tab, Typography } from '@mui/material';
import {
  IDebt,
  IFinancialPlan,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageContent, PageHeader } from 'src/components';
import ButtonInTabs from 'src/components/ButtonInTabs';
import { usePersonalFinances } from 'src/hooks/pages/client/finances';

import {
  DebtCard,
  FixedExpenseCard,
  IncomeCard,
  PersonalFinancesGraph,
  ValidateMainFinantialSnapshotDialog,
} from './components';

function getTabProps(id: string) {
  return {
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  };
}

const PersonalFinancesPage = () => {
  const { t } = useTranslation();

  const { isLoading, financialPlans, updateFinancialPlan } =
    usePersonalFinances();
  const [selectedTab, setSelectedTab] = useState('0');

  const _financialPlans = useMemo(
    () =>
      financialPlans.length
        ? financialPlans
        : ([
            {
              name: 'Main',
              fixedExpenses: [],
              incomes: [],
              financialSnapshots: [
                {
                  debts: [],
                  date: new Date(),
                  reviewed: true,
                  surplus: 0,
                },
              ],
              id: null,
            },
          ] as IFinancialPlan[]),
    [financialPlans]
  );

  function handleCreateNewPlan() {
    // clone the first personal finance plan
    // maybe open a modal later
    updateFinancialPlan({
      ..._financialPlans[0],
      id: '',
      name: `Plan ${financialPlans.length + 1}`,
    });
  }

  const isCreateNewPlanDisabled = useMemo(
    () =>
      !_financialPlans[0].financialSnapshots[
        _financialPlans[0].financialSnapshots.length - 1
      ].debts.length &&
      !_financialPlans[0].fixedExpenses.length &&
      !_financialPlans[0].incomes.length,
    [_financialPlans]
  );

  function _updateFinancialPlan(
    planId: string | null,
    data: IDebt[] | IIncome[] | IFixedExpense[],
    key: 'debts' | 'incomes' | 'fixedExpenses'
  ) {
    let plan = financialPlans.find((p) => p.id === planId);
    if (!plan) {
      plan = {
        name: 'Main',
        fixedExpenses: [],
        incomes: [],
        financialSnapshots: [
          {
            debts: [],
            date: dayjs() as any,
            reviewed: true,
            surplus: 0,
          },
        ],
        id: null,
      };
    }
    plan = {
      ...plan,
      ...(key === 'incomes' || key === 'fixedExpenses' ? { [key]: data } : {}),
      financialSnapshots: plan.financialSnapshots.map((snapshot, i) => {
        if (i === plan!.financialSnapshots.length - 1) {
          return {
            ...snapshot,
            ...(key === 'debts' ? { debts: data as IDebt[] } : {}),
            reviewed: true,
          };
        }
        return snapshot;
      }),
    };
    updateFinancialPlan(plan);
  }

  function _updateDebts(planId: string | null, data: IDebt[]) {
    if (!planId) _updateFinancialPlan(planId, data, 'debts');
    else {
      financialPlans.forEach((plan) => {
        _updateFinancialPlan(plan.id!, data, 'debts');
      });
    }
  }

  return (
    <>
      <ValidateMainFinantialSnapshotDialog
        financialPlan={financialPlans[0]}
        onSubmit={(data) => _updateDebts(financialPlans[0].id!, data)}
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
                  disabled={isCreateNewPlanDisabled || isLoading}
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
                          isLoading={isLoading}
                          update={(data) => _updateDebts(id ?? null, data)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <IncomeCard
                          incomes={incomes}
                          isLoading={isLoading}
                          update={(data) =>
                            _updateFinancialPlan(id ?? null, data, 'incomes')
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FixedExpenseCard
                          fixedExpenses={fixedExpenses}
                          debts={debts}
                          isLoading={isLoading}
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

        <Grid container>
          <Grid item xs={12}>
            <PersonalFinancesGraph
              loading={isLoading}
              financialPlans={financialPlans}
            />
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
};

export default PersonalFinancesPage;
