import {
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Grid,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/common';
import {
  Calendar,
  EditPanel,
  SummaryPanel,
} from 'src/components/pages/client/finances/trading-journal';
import { useDocumentMetadata } from 'src/hooks';
import { useTradingJournal } from 'src/hooks/pages/client/finances';
import { ITrade } from 'src/models/finances';
import { isInSameMonth, isInSameWeek } from 'src/utils';

const TradingJournalPage = () => {
  const { t } = useTranslation();
  useDocumentMetadata(`${t('finances.tradingJournal.title')} - Champions`);
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');
  const pendingFilter = useRef<'day' | 'week' | 'month'>('day');
  const [day, setDay] = useState<Dayjs>(dayjs());
  const [prevMonth, setPrevMonth] = useState<string | null>(null);
  const { loading, journal, getTradingJournalByMonth, addTradesForDay } =
    useTradingJournal();
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const currentMonth = day.format('YYYY-MM');

    if (currentMonth !== prevMonth) {
      getTradingJournalByMonth(currentMonth);
      setPrevMonth(currentMonth);
    }
  }, [day, getTradingJournalByMonth, prevMonth]);

  useEffect(() => {
    if (journal) {
      const trades = journal.operations
        .filter((operation) => {
          const tradeDay = operation.date;
          return filter === 'day'
            ? tradeDay.isSame(day, 'day')
            : filter === 'week'
              ? isInSameWeek(tradeDay, day)
              : isInSameMonth(tradeDay, day);
        })
        .flatMap((operation) => operation.trades);
      setTrades(trades);
    }
  }, [journal, day, filter]);

  const totalPL = useMemo(
    () => trades.reduce((acc, trade) => acc + trade.pl, 0),
    [trades]
  );

  const handleFilterChange = (filter: 'day' | 'week' | 'month') => () => {
    if (formIsDirty) {
      pendingFilter.current = filter;
      setDialogOpen(true);
    } else {
      setFilter(filter);
    }
  };

  return (
    <>
      <ConfirmDialog
        title={t('finances.tradingJournal.formIsDirtyTitle')}
        description={t('finances.tradingJournal.formIsDirtyDescription')}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          setFilter(pendingFilter.current);
          setDialogOpen(false);
        }}
      />
      <Breadcrumbs aria-label="navigator">
        <Link
          to="/client/finances"
          unstable_viewTransition
          style={{ textDecoration: 'none' }}
        >
          {t('finances.title')}
        </Link>
        <Typography
          variant="h6"
          style={{
            viewTransitionName: 'trading-journal',
          }}
        >
          {t('finances.tradingJournal.title')}
        </Typography>
      </Breadcrumbs>
      <Box mt={4}>
        <Grid container spacing={4}>
          <Grid item xs={6} textAlign="center">
            <ButtonGroup aria-label="filter" disableElevation>
              <Button
                variant={filter === 'day' ? 'contained' : 'outlined'}
                onClick={handleFilterChange('day')}
              >
                {t('finances.tradingJournal.day')}
              </Button>
              <Button
                variant={filter === 'week' ? 'contained' : 'outlined'}
                onClick={handleFilterChange('week')}
              >
                {t('finances.tradingJournal.week')}
              </Button>
              <Button
                variant={filter === 'month' ? 'contained' : 'outlined'}
                onClick={handleFilterChange('month')}
              >
                {t('finances.tradingJournal.month')}
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={6}>
            ALgun selectoro
          </Grid>
          <Grid item xs={12} md={6}>
            <Calendar
              day={day}
              onChange={setDay}
              filter={filter}
              isNegative={totalPL < 0}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {Boolean(filter === 'day') && (
              <EditPanel
                formIsDirtyOnChange={setFormIsDirty}
                trades={trades}
                onSubmit={(data) =>
                  addTradesForDay(journal, {
                    date: day,
                    trades: data,
                    notes: '',
                  })
                }
              />
            )}
          </Grid>
          <Grid item xs={12} mt={4}>
            <SummaryPanel
              amount={10}
              monthlyGrowth={10}
              percentage={10}
              trades={22}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default TradingJournalPage;
