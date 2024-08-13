import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { IDebt } from 'src/types/models/finances';
import { firestore } from 'src/firebase';
import { useAuth } from 'src/context/auth';
import { dateToTimestamp, formatDateToYYYYMMDD } from 'src/utils';

interface UseDebtsResult {
  debts: IDebt[];
  isLoading: boolean;
  error: Error | null;
  updateDebts: (newDebts: IDebt[]) => Promise<void>;
}

export const useDebts = (): UseDebtsResult => {
  const [debts, setDebts] = useState<IDebt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuth();

  useEffect(() => {
    const fetchDebts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = doc(firestore, 'debts', user.currentUser!.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as { data: IDebt[] };
          const convertedDebts = data.data.map((debt) => ({
            ...debt,
            startDate: formatDateToYYYYMMDD(
              (debt.startDate as unknown as Timestamp).toDate()
            ),
          }));
          setDebts(convertedDebts);
        } else {
          setDebts([]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, [user.currentUser]);

  const updateDebts = useCallback(
    async (newDebts: IDebt[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = doc(firestore, 'debts', user.currentUser!.uid);
        const formattedDebts = newDebts.map((debt) => ({
          ...debt,
          startDate: dateToTimestamp(debt.startDate),
        }));
        await setDoc(docRef, { data: formattedDebts });
        setDebts(newDebts);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

  return { debts, isLoading, error, updateDebts };
};
