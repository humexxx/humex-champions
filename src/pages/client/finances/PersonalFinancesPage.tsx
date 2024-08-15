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
import {
  IDebt,
  IFinancialPlan,
  IFixedExpense,
  IIncome,
} from 'src/types/models/finances';
import dayjs from 'dayjs';

function getTabProps(id: string) {
  return {
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  };
}

const PersonalFinancesPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.personalFinances.title')} - Champions`);

  const { error, isLoading, financialPlans, updateFinancialPlan } =
    usePersonalFinances();
  const [selectedTab, setSelectedTab] = useState('0');

  const _financialPlans = useMemo(
    () =>
      financialPlans.length
        ? financialPlans
        : ([
            {
              name: 'Main',
              financialSnapshots: [
                {
                  debts: [],
                  fixedExpenses: [],
                  incomes: [],
                  date: new Date(),
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

  const isCreateNewPlanDisabled = useMemo(() => {
    const lastSnapshotFromMainPlan =
      _financialPlans[0].financialSnapshots[
        _financialPlans[0].financialSnapshots.length - 1
      ];
    return (
      !lastSnapshotFromMainPlan.debts.length &&
      !lastSnapshotFromMainPlan.fixedExpenses.length &&
      !lastSnapshotFromMainPlan.debts.length
    );
  }, [_financialPlans]);

  function _updateFinancialPlan(
    planId: string | null,
    data: IDebt[] | IIncome[] | IFixedExpense[],
    key: 'debts' | 'incomes' | 'fixedExpenses'
  ) {
    let plan = financialPlans.find((p) => p.id === planId);
    if (!plan) {
      plan = {
        name: 'Main',
        financialSnapshots: [
          {
            debts: [],
            fixedExpenses: [],
            incomes: [],
            date: dayjs(),
          },
        ],
        id: null,
      };
    }
    plan = {
      ...plan,
      financialSnapshots: plan.financialSnapshots.map((snapshot, i) => {
        if (i === plan!.financialSnapshots.length - 1) {
          return {
            ...snapshot,
            [key]: data,
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
              />
            </TabList>
          </Box>
          {_financialPlans.map(({ id, financialSnapshots }, i) => {
            const { debts, fixedExpenses, incomes } =
              financialSnapshots[financialSnapshots.length - 1];

            return (
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
              </Grow>
            );
          })}
        </TabContext>
      </Box>

      <Grid container>
        <Grid item xs={12}>
          <PersonalFinancesGraph financialPlans={financialPlans} />
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
