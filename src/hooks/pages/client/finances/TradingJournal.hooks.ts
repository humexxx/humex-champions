import { useState, useCallback } from 'react';

import { IOperation, ITradingJournal } from '@shared/models/finances';
import dayjs from 'dayjs';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useAuth } from 'src/context/auth';
import { firestore } from 'src/firebase';
import { objectDateConverter, toDayjs, toTimestamp } from 'src/utils';

function injectEndBalance(operation: IOperation) {
  operation.balanceEnd =
    operation.balanceStart +
    operation.trades.reduce((acc, trade) => acc + trade.pl, 0) +
    (operation.transactions?.reduce(
      (acc, transaction) =>
        acc + transaction.amount * (transaction.type === 'deposit' ? 1 : -1),
      0
    ) ?? 0);
  return operation;
}

const createNextDayOperationFromOperation = (
  operation: IOperation
): IOperation | null => {
  const nextDay = operation.date.add(1, 'day');

  if (nextDay.isSame(operation.date, 'month')) {
    return {
      date: nextDay,
      balanceStart: operation.balanceEnd,
      trades: [],
      transactions: [],
      balanceEnd: operation.balanceEnd,
      notes: '',
    };
  }

  return null;
};

export const useTradingJournal = () => {
  const [journal, setJournal] = useState<ITradingJournal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();

  const getTradingJournalByMonth = useCallback(
    async (month: string) => {
      setLoading(true);
      setError(null);

      try {
        const journalRef = collection(
          firestore,
          'finances',
          user.currentUser!.uid,
          'tradingJournal'
        );

        const startOfMonth = dayjs(month, 'YYYY-MM').startOf('month').toDate();
        const endOfMonth = dayjs(month, 'YYYY-MM').endOf('month').toDate();

        const startTimestamp = Timestamp.fromDate(startOfMonth);
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        let journalQuery = query(
          journalRef,
          where('date', '>=', startTimestamp),
          where('date', '<=', endTimestamp)
        );
        let snapshot = await getDocs(journalQuery);

        // If the document doesn't exist, try to get the last one
        if (snapshot.empty) {
          journalQuery = query(
            journalRef,
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          snapshot = await getDocs(journalQuery);
        }

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setJournal(
            objectDateConverter(
              { id: doc.id, ...doc.data() },
              toDayjs
            ) as ITradingJournal
          );
        } else {
          setJournal(null);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching trading journal');
      } finally {
        setLoading(false);
      }
    },
    [user.currentUser]
  );

  const updateTradingJournal = useCallback(
    async (tradingJournal: ITradingJournal | null, operation: IOperation) => {
      setLoading(true);
      setError(null);

      try {
        operation = injectEndBalance(operation);
        const nextDayOperation = createNextDayOperationFromOperation(operation);

        const operations = [
          operation,
          ...(nextDayOperation ? [nextDayOperation] : []),
        ];

        if (!nextDayOperation) {
          const nextDay = operation.date.add(1, 'day');
          const nextJournal: ITradingJournal = {
            date: nextDay.startOf('month'),
            operations: [
              {
                date: nextDay,
                balanceStart: operation.balanceEnd,
                trades: [],
                transactions: [],
                balanceEnd: operation.balanceEnd,
                notes: '',
              },
            ],
          };

          const journalRef = collection(
            firestore,
            'finances',
            user.currentUser!.uid,
            'tradingJournal'
          );
          await addDoc(
            journalRef,
            objectDateConverter(nextJournal, toTimestamp)
          );
        }

        if (tradingJournal) {
          // Si el documento ya existe, simplemente agrega la nueva operación
          const docRef = doc(
            firestore,
            'finances',
            user.currentUser!.uid,
            'tradingJournal',
            tradingJournal.id!
          );

          const updatedOperations = [
            ...tradingJournal.operations.filter(
              (x) => !x.date.isSame(operation.date, 'day')
            ),
            ...operations,
          ];

          await updateDoc(docRef, {
            operations: objectDateConverter(updatedOperations, toTimestamp),
          });

          setJournal({ ...tradingJournal, operations: updatedOperations });
        } else {
          const newJournal: ITradingJournal = {
            date: operation.date.startOf('month'),
            operations: [...operations],
          };

          const journalRef = collection(
            firestore,
            'finances',
            user.currentUser!.uid,
            'tradingJournal'
          );
          const docRef = await addDoc(
            journalRef,
            objectDateConverter(newJournal, toTimestamp)
          );
          setJournal({ id: docRef.id, ...newJournal });
        }
      } catch (err) {
        console.error(err);
        setError('Error adding trade');
      } finally {
        setLoading(false);
      }
    },
    [user.currentUser]
  );

  return {
    journal,
    loading,
    error,
    getTradingJournalByMonth,
    updateTradingJournal,
  };
};
