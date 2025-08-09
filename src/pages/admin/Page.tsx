import { useRef, useState } from 'react';

import BarChartIcon from '@mui/icons-material/BarChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Grid, Typography } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import {
  ButtonOptionCard,
  ConfirmDialog,
  PageContent,
  PageHeader,
} from 'src/components';
import { functions } from 'src/firebase';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const functionToCall = useRef<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onConfirm() {
    if (functionToCall.current) {
      setIsOpen(false);
      setIsLoading(true);
      try {
        const _function = httpsCallable(functions, functionToCall.current);
        const response = await _function();
        console.log(response);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <>
      <ConfirmDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirm}
        title="Confirm Action"
        description="Are you sure you want to execute this admin function?"
      />
      <PageHeader title="Admin Panel" />
      <PageContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Finances
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <ButtonOptionCard
              loading={
                isLoading &&
                functionToCall.current ===
                  'adminPersonalFinanceSnapshotGeneration'
              }
              label="Personal Finances"
              description="Generate personal finance snapshots for all users"
              icon={<BarChartIcon color="primary" />}
              onClick={() => {
                setIsOpen(true);
                functionToCall.current =
                  'adminPersonalFinanceSnapshotGeneration';
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ButtonOptionCard
              loading={
                isLoading &&
                functionToCall.current === 'adminPortfolioSnapshotGeneration'
              }
              label="Portfolio"
              description="Generate portfolio snapshots for all users"
              icon={<PieChartIcon color="primary" />}
              onClick={() => {
                setIsOpen(true);
                functionToCall.current = 'adminPortfolioSnapshotGeneration';
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Self Development
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <ButtonOptionCard
              loading={
                isLoading &&
                functionToCall.current === 'adminChecklistReportGeneration'
              }
              label="Checklist Reports"
              description="Generate checklist reports for all users"
              icon={<ChecklistIcon color="primary" />}
              onClick={() => {
                setIsOpen(true);
                functionToCall.current = 'adminChecklistReportGeneration';
              }}
            />
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
};

export default Page;
