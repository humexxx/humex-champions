import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  IDebt,
  IFixedExpense,
  IIncome,
  IPersonalFinances,
} from 'src/types/models/finances';
import { firestore } from 'src/firebase';
import { useAuth } from 'src/context/auth';
import { dateToTimestamp, formatDateToYYYYMMDD } from 'src/utils';

interface UsePersonalFinancesResult {
  personalFinances: IPersonalFinances[];
  isLoading: boolean;
  error: Error | null;
  updateDebts: (
    newDebts: IDebt[],
    personalFinancesId?: string
  ) => Promise<void>;
  updateFixedExpenses: (
    newFixedExpenses: IFixedExpense[],
    personalFinancesId?: string
  ) => Promise<void>;
  updateIncomes: (
    newIncomes: IIncome[],
    personalFinancesId?: string
  ) => Promise<void>;
}

export const usePersonalFinances = (): UsePersonalFinancesResult => {
  const [personalFinances, setPersonalFinances] = useState<IPersonalFinances[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuth();

  useEffect(() => {
    const fetchPersonalFinances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const collectionRef = collection(
          firestore,
          'finances',
          user.currentUser!.uid,
          'personalFinances'
        );
        const querySnapshot = await getDocs(collectionRef);

        const finances = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data() as {
            debts: IDebt[];
            fixedExpenses: IFixedExpense[];
            incomes: IIncome[];
          };

          return {
            id: docSnap.id,
            debts:
              data.debts?.map((debt) => ({
                ...debt,
                startDate: formatDateToYYYYMMDD(
                  (debt.startDate as unknown as Timestamp).toDate()
                ),
              })) || [],
            fixedExpenses:
              data.fixedExpenses?.map((expense) => ({
                ...expense,
                startDate: formatDateToYYYYMMDD(
                  (expense.startDate as unknown as Timestamp).toDate()
                ),
              })) || [],
            incomes:
              data.incomes?.map((income) => ({
                ...income,
                startDate: formatDateToYYYYMMDD(
                  (income.startDate as unknown as Timestamp).toDate()
                ),
              })) || [],
          };
        });

        setPersonalFinances(finances);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.currentUser) {
      fetchPersonalFinances();
    }
  }, [user.currentUser]);

  const updateStateAfterUpdate = (
    updatedField: 'debts' | 'fixedExpenses' | 'incomes',
    newData: IDebt[] | IFixedExpense[] | IIncome[],
    personalFinancesId: string
  ) => {
    setPersonalFinances((prevState) => {
      const existingFinances = prevState.find(
        (finances) => finances.id === personalFinancesId
      );

      if (existingFinances) {
        return prevState.map((finances) =>
          finances.id === personalFinancesId
            ? { ...finances, [updatedField]: newData }
            : finances
        );
      } else {
        return [
          ...prevState,
          {
            id: personalFinancesId,
            debts: updatedField === 'debts' ? (newData as IDebt[]) : [],
            fixedExpenses:
              updatedField === 'fixedExpenses'
                ? (newData as IFixedExpense[])
                : [],
            incomes: updatedField === 'incomes' ? (newData as IIncome[]) : [],
          },
        ];
      }
    });
  };

  const updateDebts = useCallback(
    async (newDebts: IDebt[], personalFinancesId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = personalFinancesId
          ? doc(
              firestore,
              'finances',
              user.currentUser!.uid,
              'personalFinances',
              personalFinancesId
            )
          : doc(
              collection(
                firestore,
                'finances',
                user.currentUser!.uid,
                'personalFinances'
              )
            );

        const formattedDebts = newDebts.map((debt) => ({
          ...debt,
          startDate: dateToTimestamp(debt.startDate),
        }));
        await setDoc(docRef, { debts: formattedDebts }, { merge: true });

        updateStateAfterUpdate('debts', newDebts, docRef.id);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

  const updateFixedExpenses = useCallback(
    async (newFixedExpenses: IFixedExpense[], personalFinancesId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = personalFinancesId
          ? doc(
              firestore,
              'finances',
              user.currentUser!.uid,
              'personalFinances',
              personalFinancesId
            )
          : doc(
              collection(
                firestore,
                'finances',
                user.currentUser!.uid,
                'personalFinances'
              )
            );

        const formattedFixedExpenses = newFixedExpenses.map((expense) => ({
          ...expense,
          startDate: dateToTimestamp(expense.startDate),
        }));
        await setDoc(
          docRef,
          { fixedExpenses: formattedFixedExpenses },
          { merge: true }
        );

        updateStateAfterUpdate('fixedExpenses', newFixedExpenses, docRef.id);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

  const updateIncomes = useCallback(
    async (newIncomes: IIncome[], personalFinancesId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = personalFinancesId
          ? doc(
              firestore,
              'finances',
              user.currentUser!.uid,
              'personalFinances',
              personalFinancesId
            )
          : doc(
              collection(
                firestore,
                'finances',
                user.currentUser!.uid,
                'personalFinances'
              )
            );

        const formattedIncomes = newIncomes.map((income) => ({
          ...income,
          startDate: dateToTimestamp(income.startDate),
        }));
        await setDoc(docRef, { incomes: formattedIncomes }, { merge: true });

        updateStateAfterUpdate('incomes', newIncomes, docRef.id);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

  return {
    personalFinances,
    isLoading,
    error,
    updateDebts,
    updateFixedExpenses,
    updateIncomes,
  };
};
