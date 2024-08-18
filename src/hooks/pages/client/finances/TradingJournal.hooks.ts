import dayjs from 'dayjs';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useState, useCallback } from 'react';
import { useAuth } from 'src/context/auth';
import { firestore } from 'src/firebase';
import { IOperation, ITradingJournal } from 'src/models/finances';
import { objectDateConverter, toDayjs, toTimestamp } from 'src/utils';

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

        const journalQuery = query(
          journalRef,
          where('date', '>=', startTimestamp),
          where('date', '<=', endTimestamp)
        );
        const snapshot = await getDocs(journalQuery);

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

  const addTradesForDay = useCallback(
    async (
      tradingJournal: ITradingJournal | null,
      newOperation: IOperation
    ) => {
      setLoading(true);
      setError(null);

      try {
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
              (x) => !x.date.isSame(newOperation.date, 'day')
            ),
            newOperation,
          ];

          console.log(objectDateConverter(updatedOperations, toTimestamp));

          await updateDoc(docRef, {
            operations: objectDateConverter(updatedOperations, toTimestamp),
          });
          setJournal({ ...tradingJournal, operations: updatedOperations });
        } else {
          const newJournal: ITradingJournal = {
            date: newOperation.date.startOf('month'),
            operations: [newOperation],
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
    addTradesForDay,
  };
};
