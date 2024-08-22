import { Box, Breadcrumbs, Slider, Tab, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { PageHeader } from 'src/components';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SwipeableViews from 'react-swipeable-views-react-18-fix';
import { useCallback, useState } from 'react';
import { Graph, Inputs } from './components';
import ButtonInTabs from 'src/components/ButtonInTabs';
import AddIcon from '@mui/icons-material/Add';
import { MULTIPLE_GRAPH_COLORS } from 'src/consts';

const MAX_INVESTMENTS = 10;

export interface DataSet {
  id?: number;
  initialInvestment: number;
  monthlyContribution: number;
  interestRate: number;
}

function getTabProps(id: string) {
  return {
    id: `tab-${id}`,
    'aria-controls': `tabpanel-${id}`,
  };
}

const CompoundInterestCalculatorPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.compound-calculator.title')} - Champions`);

  const [selectedTab, setSelectedTab] = useState('0');
  const [years, setYears] = useState(10);
  const [data, setData] = useState<DataSet[]>([
    {
      id: 1,
      initialInvestment: 1000,
      monthlyContribution: 500,
      interestRate: 12,
    },
  ]);

  const OnChange = useCallback((index: number, data: DataSet) => {
    setData((prev) => {
      const next = [...prev];
      next[index] = { ...data, id: prev[index].id };
      return next;
    });
  }, []);

  function addInvestmentPlanOnClick() {
    setData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        years: 10,
        initialInvestment: 1000,
        monthlyContribution: 500,
        interestRate: 12,
      },
    ]);
    setSelectedTab(data.length.toString());
  }

  function removeInvestmentPlanOnClick(id?: number) {
    if (!id) {
      return;
    }
    setData((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader>
        <Breadcrumbs aria-label="navigator">
          <Typography
            component={Link}
            to="/client/finances"
            unstable_viewTransition
            color={'info.main'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} color="inherit" />
            {t('finances.title')}
          </Typography>
          <Typography
            variant="body1"
            style={{
              viewTransitionName: 'compound-calculator',
            }}
            color="text.primary"
          >
            <strong>{t('finances.compound-calculator.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>

      <Box mb={2}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mb={2}>
            <TabList
              onChange={(_, tab) => setSelectedTab(tab)}
              aria-label="compound interest calculator tabs"
              scrollButtons="auto"
              variant="scrollable"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: MULTIPLE_GRAPH_COLORS[Number(selectedTab)],
                },
              }}
            >
              {data.map((_, i) => (
                <Tab
                  key={i}
                  label={`${t('finances.compound-calculator.investment')} ${i + 1}`}
                  value={i.toString()}
                  {...getTabProps(i.toString())}
                  sx={{
                    color: `${MULTIPLE_GRAPH_COLORS[i]} !important`,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                />
              ))}
              <ButtonInTabs
                tooltipText={
                  !data.length || data.length < MAX_INVESTMENTS
                    ? t('finances.compound-calculator.addInvestment')
                    : t('finances.compound-calculator.maxInvestments')
                }
                onClick={addInvestmentPlanOnClick}
                disabled={data.length >= MAX_INVESTMENTS}
                icon={<AddIcon />}
              />
            </TabList>
          </Box>
          <SwipeableViews
            index={Number(selectedTab)}
            onChangeIndex={(i) => setSelectedTab(i.toString())}
            containerStyle={{
              transition: 'transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s',
            }}
          >
            {data.map((_, i) => (
              <TabPanel key={i} value={i.toString()} sx={{ p: 2 }}>
                <Inputs
                  onChange={(data) => OnChange(i, data)}
                  customData={data[i]}
                  onRemove={
                    i
                      ? () => removeInvestmentPlanOnClick(data[i]?.id)
                      : undefined
                  }
                />
              </TabPanel>
            ))}
          </SwipeableViews>
        </TabContext>
      </Box>
      <Graph data={data} years={years} />
      <Box mt={4}>
        <Slider
          value={years}
          onChange={(_, value) => setYears(value as number)}
          min={1}
          max={50}
          step={1}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => `${value} ${t('common.years')}`}
          marks={[
            {
              value: 1,
              label: '1 Year',
            },
            {
              value: 10,
              label: '10 Years',
            },
            {
              value: 15,
              label: '15 Years',
            },
            {
              value: 20,
              label: '20 Years',
            },
            {
              value: 25,
              label: '25 Years',
            },
            {
              value: 50,
              label: '50 Years',
            },
          ]}
        />
      </Box>
    </>
  );
};

export default CompoundInterestCalculatorPage;
