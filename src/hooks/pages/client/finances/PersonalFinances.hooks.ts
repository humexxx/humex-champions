import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { IFinancialPlan } from 'src/models/finances';
import { firestore } from 'src/firebase';
import { useAuth } from 'src/context/auth';
import dayjs from 'dayjs';
import { toTimestamp } from 'src/utils';

interface UsePersonalFinancesResult {
  financialPlans: IFinancialPlan[];
  isLoading: boolean;
  error: Error | null;
  updateFinancialPlan: (financialPlan: IFinancialPlan) => Promise<void>;
}

export const usePersonalFinances = (): UsePersonalFinancesResult => {
  const [financialPlans, setFinancialPlans] = useState<IFinancialPlan[]>([]);
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
          'financialPlans'
        );
        const querySnapshot = await getDocs(collectionRef);

        const plans = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data() as IFinancialPlan;

          return {
            id: docSnap.id,
            name: data.name,
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
            financialSnapshots: data.financialSnapshots.map(
              ({ date, debts, ...x }) => ({
                ...x,
                debts:
                  debts?.map((debt) => ({
                    ...debt,
                    startDate: dayjs(
                      (debt.startDate as unknown as Timestamp).toDate()
                    ),
                  })) || [],
                date: dayjs((date as unknown as Timestamp).toDate()),
              })
            ),
          };
        });

        setFinancialPlans(plans);
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

  const updateFinancialPlan = useCallback(
    async (financialPlan: IFinancialPlan) => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = financialPlan.id
          ? doc(
              firestore,
              'finances',
              user.currentUser!.uid,
              'financialPlans',
              financialPlan.id
            )
          : doc(
              collection(
                firestore,
                'finances',
                user.currentUser!.uid,
                'financialPlans'
              )
            );

        const { id, fixedExpenses, incomes, ...rest } = financialPlan;

        const formattedFinancialPlan: IFinancialPlan = {
          ...rest,
          fixedExpenses: fixedExpenses.map((expense) => ({
            ...expense,
            startDate: toTimestamp(expense.startDate),
          })),
          incomes: incomes.map((income) => ({
            ...income,
            startDate: toTimestamp(income.startDate),
          })),
          financialSnapshots: financialPlan.financialSnapshots.map((x) => ({
            ...x,
            date: toTimestamp(x.date),
            debts: x.debts.map((debt) => ({
              ...debt,
              startDate: toTimestamp(debt.startDate),
            })),
          })),
        };

        await setDoc(docRef, formattedFinancialPlan);

        setFinancialPlans((prevState) =>
          id
            ? prevState.map((plan) => (plan.id === id ? financialPlan : plan))
            : [...prevState, { ...financialPlan, id: docRef.id }]
        );
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user.currentUser]
  );

  return {
    financialPlans,
    isLoading,
    error,
    updateFinancialPlan,
  };
};
