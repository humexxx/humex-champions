import { Alert, Breadcrumbs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDocumentMetadata } from 'src/hooks';
import { GlobalLoader, PageContent, PageHeader } from 'src/components';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePortfolio } from './hooks';
import { CreatePortfolio, PortfolioView } from './components';
import { toDayjs } from 'src/utils';
import { IPortfolioSnapshot } from 'src/models/finances';

const mockData: IPortfolioSnapshot[] = [
  {
    date: toDayjs(new Date('2021-01-01')),
    id: '1',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 50,
        value: 1000,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 50,
        value: 1000,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toDayjs(new Date('2021-04-01')),
    id: '2',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 60,
        value: 1200,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 40,
        value: 800,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toDayjs(new Date('2021-08-01')),
    id: '3',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 70,
        value: 1400,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 30,
        value: 600,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
  {
    date: toDayjs(new Date('2021-12-01')),
    id: '4',
    instruments: [
      {
        id: '1',
        name: 'Stocks',
        positionPercentage: 80,
        value: 1600,
      },
      {
        id: '2',
        name: 'Bonds',
        positionPercentage: 20,
        value: 400,
      },
    ],
    totalValue: 2000,
    totalProfit: 0,
    totalProfitPercentage: 0,
  },
];

const Page = () => {
  const { t } = useTranslation();
  const { error, isLoading, portfolioSnapshots, initPortfolio } =
    usePortfolio();
  useDocumentMetadata(`${t('finances.portfolio.title')} - Champions`);

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
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
              viewTransitionName: 'portfolio',
            }}
            color="text.primary"
          >
            <strong>{t('finances.portfolio.title')}</strong>
          </Typography>
        </Breadcrumbs>
      </PageHeader>

      <PageContent>
        {isLoading ? (
          <GlobalLoader />
        ) : portfolioSnapshots.length ? (
          <PortfolioView portfolioSnapshots={mockData} />
        ) : (
          <CreatePortfolio onSubmit={initPortfolio} pageLoading={isLoading} />
        )}
      </PageContent>
    </>
  );
};

export default Page;
