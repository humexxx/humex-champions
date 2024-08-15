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
  IPersonalFinance,
} from 'src/types/models/finances';
import { firestore } from 'src/firebase';
import { useAuth } from 'src/context/auth';
import dayjs from 'dayjs';

interface UsePersonalFinancesResult {
  personalFinances: IPersonalFinance[];
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
  addPersonalFinance: (personalFinance: IPersonalFinance) => Promise<void>;
}

export const usePersonalFinances = (): UsePersonalFinancesResult => {
  const [personalFinances, setPersonalFinances] = useState<IPersonalFinance[]>(
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
                startDate: dayjs(
                  (debt.startDate as unknown as Timestamp).toDate()
                ),
              })) || [],
            fixedExpenses:
              data.fixedExpenses?.map((expense) => ({
                ...expense,
                startDate: dayjs(
                  (expense.startDate as unknown as Timestamp).toDate()
                ),
              })) || [],
            incomes:
              data.incomes?.map((income) => ({
                ...income,
                startDate: dayjs(
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

      for (let i = 0; i < newData.length; i++) {
        newData[i] = {
          ...newData[i],
          startDate: dayjs(newData[i].startDate),
        };
      }

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

  const addPersonalFinance = useCallback(
    async (personalFinance: IPersonalFinance) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = doc(
          collection(
            firestore,
            'finances',
            user.currentUser!.uid,
            'personalFinances'
          )
        );

        const formattedPersonalFinance = {
          id: null,
          debts: personalFinance.debts.map((debt) => ({
            ...debt,
            startDate: Timestamp.fromDate(debt.startDate.toDate()),
          })),
          fixedExpenses: personalFinance.fixedExpenses.map((expense) => ({
            ...expense,
            startDate: Timestamp.fromDate(expense.startDate.toDate()),
          })),
          incomes: personalFinance.incomes.map((income) => ({
            ...income,
            startDate: Timestamp.fromDate(income.startDate.toDate()),
          })),
        };

        await setDoc(docRef, formattedPersonalFinance);

        setPersonalFinances((prevState) => [
          ...prevState,
          { ...personalFinance, id: docRef.id },
        ]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

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
          startDate: Timestamp.fromDate(debt.startDate),
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
          startDate: Timestamp.fromDate(expense.startDate),
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
          startDate: Timestamp.fromDate(income.startDate),
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
    addPersonalFinance,
    updateDebts,
    updateFixedExpenses,
    updateIncomes,
  };
};
