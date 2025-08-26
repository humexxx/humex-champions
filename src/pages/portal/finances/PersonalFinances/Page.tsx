import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Typography,
} from '@mui/material';
import { IDebt, IFixedExpense, IIncome } from '@shared/models/finances';
import dayjs from 'dayjs';
import ButtonInTabs from 'src/components/ButtonInTabs';

import { PageContainer } from '../../../../components/layout';
import {
  DebtCard,
  FixedExpenseCard,
  IncomeCard,
  PersonalFinancesGraph,
  PersonalFinancesGrid,
} from './_components';
import useFinancialPlans from './useFinancialPlans';

const MAX_PLANS = 5;

function getTabProps(id: string) {
  return {
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  };
}

const PersonalFinancesPage = () => {
  const { data: financialPlans, error, loading, set } = useFinancialPlans();
  const [_, setIsAddingNewPlan] = useState(false);
  const [selectedTab, setSelectedTab] = useState('0');

  useEffect(() => {
    if (financialPlans?.length) {
      setSelectedTab(financialPlans.length - 1 + '');
      setIsAddingNewPlan(false);
    }
  }, [financialPlans.length]);

  function handleCreateNewPlan() {
    set({
      ...financialPlans[0],
      name: `Plan ${financialPlans.length + 1}`,
      id: '',
    });
  }

  function handleCreateFirstPlan() {
    set({
      id: '',
      name: 'Mi Plan Financiero',
      debts: [],
      incomes: [],
      fixedExpenses: [],
      financialSnapshots: [
        {
          date: dayjs(),
          debts: [],
          incomes: [],
          fixedExpenses: [],
          reviewed: false,
          expectedSurplus: 0,
        },
      ],
    });
  }

  function _updateFinancialPlan(
    planId: string,
    data: IDebt[] | IIncome[] | IFixedExpense[],
    key: 'debts' | 'incomes' | 'fixedExpenses'
  ) {
    let plan = financialPlans.find((p) => p.id === planId)!;
    plan = {
      ...plan,
      [key]: data,
      financialSnapshots: plan.financialSnapshots.map((snapshot, i) => {
        if (i === plan.financialSnapshots.length - 1) {
          return {
            ...snapshot,
            [key]: data,
          };
        }
        return snapshot;
      }),
    };
    set(plan);
    setIsAddingNewPlan(true);
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      {/* <ValidateMainFinantialSnapshotDialog
        financialPlan={financialPlans[0]}
        onSubmit={(data) => _updateDebts(financialPlans[0].id!, data)}
      /> */}
      <PageContainer title="Finances">
        {financialPlans.length === 0 && !loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <Card sx={{ maxWidth: 600, textAlign: 'center', p: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  No Financial Plans
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Create your first financial plan to start organizing your
                  income, expenses and debts.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleCreateFirstPlan}
                  disabled={loading}
                >
                  Create My First Plan
                </Button>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <>
            <Box mb={4}>
              {financialPlans.length > 0 && (
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
                            selectedTab === '0'
                              ? 'warning.main'
                              : 'primary.main',
                        },
                      }}
                    >
                      {financialPlans.map(({ id, name }, i) => (
                        <Tab
                          key={`tab-${id}`}
                          label={name}
                          value={i.toString()}
                          {...getTabProps(id ?? '')}
                        />
                      ))}
                      <ButtonInTabs
                        tooltipText="Add a new financial plan to compare different scenarios"
                        onClick={handleCreateNewPlan}
                        disabled={financialPlans.length >= MAX_PLANS || loading}
                        icon={<AddIcon />}
                      />
                    </TabList>
                  </Box>

                  {financialPlans.map(
                    ({ id, fixedExpenses, incomes, debts }, i) => {
                      return (
                        <TabPanel
                          key={`tab-panel-${id}`}
                          value={i.toString()}
                          sx={{ p: 2 }}
                        >
                          <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <DebtCard
                                canEdit={i === 0}
                                debts={debts}
                                isLoading={loading}
                                update={(data) =>
                                  _updateFinancialPlan(id, data, 'debts')
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <IncomeCard
                                incomes={incomes}
                                isLoading={loading}
                                update={(data) =>
                                  _updateFinancialPlan(id, data, 'incomes')
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FixedExpenseCard
                                fixedExpenses={fixedExpenses}
                                debts={debts}
                                isLoading={loading}
                                update={(data) =>
                                  _updateFinancialPlan(
                                    id,
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
              )}
            </Box>
            <Grid container rowSpacing={4}>
              <Grid size={12}>
                {financialPlans.length > 0 && !loading && (
                  <>
                    <Typography variant="h6" mb={2}>
                      Grafico de los planes financieros
                    </Typography>
                    <PersonalFinancesGraph
                      loading={loading}
                      financialPlans={financialPlans}
                      currentIndex={Number(selectedTab)}
                    />
                  </>
                )}
              </Grid>
              <Grid size={12}>
                {financialPlans.length > 0 && !loading && (
                  <>
                    <Typography variant="h6" mb={2}>
                      Detalles del Plan Financiero
                    </Typography>
                    <PersonalFinancesGrid
                      loading={loading}
                      financialPlan={financialPlans[Number(selectedTab)]}
                    />
                  </>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </PageContainer>
    </>
  );
};

export default PersonalFinancesPage;
