import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
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

  const ButtonInTabs = ({ onClick }: { onClick: () => void }) => {
    return (
      <Box>
        <Tooltip title="test">
          <IconButton color="primary" onClick={onClick}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
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

      <Box mb={2}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={(_, tab) => setSelectedTab(tab)}
              aria-label="personal finances ideas"
              scrollButtons="auto"
            >
              {_personalFinances.map(({ id }, i) => (
                <Tab
                  key={`tab-${id}`}
                  label={!i ? 'Original' : 'Plan ' + i}
                  value={i.toString()}
                  {...getTabProps(i)}
                />
              ))}
              <ButtonInTabs onClick={() => console.log('test')} />
            </TabList>
          </Box>
          {_personalFinances.map(({ id, debts, fixedExpenses, incomes }, i) => (
            <TabPanel key={`tab-panel-${id}`} value={i.toString()}>
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

export default PersonalFinancesPage;
