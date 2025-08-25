import { useCallback, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Slider, Tab } from '@mui/material';
import { PageContent, PageHeader } from 'src/components';
import ButtonInTabs from 'src/components/ButtonInTabs';
import { MULTIPLE_GRAPH_COLORS, ROUTES } from 'src/consts';

import { PageContainer } from '../../../../components/layout';
import { Graph, Inputs } from './_components';

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
    <PageContainer title={'Compound Calculator'}>
      <PageHeader
        title="Compound Calculator"
        navigator={{
          breadcrumb: [
            {
              title: 'Finances',
              route: ROUTES.PORTAL.FINANCES.INDEX,
            },
          ],
          link: {
            title: 'Compound Calculator',
            route: 'compound-calculator',
          },
        }}
      />

      <PageContent>
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
                    label={`Investment ${i + 1}`}
                    value={i.toString()}
                    {...getTabProps(i.toString())}
                    sx={{
                      color: `${MULTIPLE_GRAPH_COLORS[i]} !important`,
                    }}
                  />
                ))}
                <ButtonInTabs
                  tooltipText={
                    !data.length || data.length < MAX_INVESTMENTS
                      ? 'Add Investment'
                      : 'Maximum investments reached'
                  }
                  onClick={addInvestmentPlanOnClick}
                  disabled={data.length >= MAX_INVESTMENTS}
                  icon={<AddIcon />}
                />
              </TabList>
            </Box>
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
            valueLabelFormat={(value) => `${value} Years`}
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
      </PageContent>
    </PageContainer>
  );
};

export default CompoundInterestCalculatorPage;
