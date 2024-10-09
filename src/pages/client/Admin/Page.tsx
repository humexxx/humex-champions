import { Grid, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ButtonOptionCard,
  ConfirmDialog,
  PageContent,
  PageHeader,
} from 'src/components';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { functions } from 'src/firebase';
import { httpsCallable } from 'firebase/functions';

const Page = () => {
  const { t } = useTranslation();
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
        title={t('admin.confirmDialog.title')}
        description={t('admin.confirmDialog.description')}
      />
      <PageHeader title={t('admin.title')} />
      <PageContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {t('finances.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <ButtonOptionCard
              loading={
                isLoading &&
                functionToCall.current ===
                  'adminPersonalFinanceSnapshotGeneration'
              }
              label={t('finances.personalFinances.title')}
              description={t('admin.options.personalFinancesDescription')}
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
              label={t('finances.portfolio.title')}
              description={t('admin.options.portfolioDescription')}
              icon={<PieChartIcon color="primary" />}
              onClick={() => {
                setIsOpen(true);
                functionToCall.current = 'adminPortfolioSnapshotGeneration';
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {t('uplift.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <ButtonOptionCard
              loading={
                isLoading &&
                functionToCall.current === 'adminChecklistReportGeneration'
              }
              label={t('uplift.checklist.title')}
              description={t('admin.options.checklistDescription')}
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
