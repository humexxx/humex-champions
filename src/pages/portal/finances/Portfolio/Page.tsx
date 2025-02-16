import { Alert } from '@mui/material';
import { IPortfolioSnapshot } from '@shared/models/finances';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { GlobalLoader, PageContent, PageHeader } from 'src/components';
import { ROUTES } from 'src/consts';
import { toDayjs } from 'src/utils';

import { CreatePortfolio, PortfolioView } from './components';
import { usePortfolio } from './hooks';

const mockData: IPortfolioSnapshot<Dayjs>[] = [
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

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <PageHeader
        title={t('finances.portfolio.title')}
        breadcrumb={[
          {
            title: t('finances.title'),
            route: ROUTES.PORTAL.FINANCES.INDEX,
          },
          {
            title: t('finances.portfolio.title'),
            route: 'portfolio',
          },
        ]}
      />

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
