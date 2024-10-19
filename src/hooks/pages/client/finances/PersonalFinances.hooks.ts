import { useEffect, useState, useCallback } from 'react';

import { IFinancialPlan } from '@shared/models/finances';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { toDayjs, toTimestamp } from 'src/utils';

interface UsePersonalFinancesResult {
  financialPlans: IFinancialPlan[];
  isLoading: boolean;
  error: Error | null;
  updateFinancialPlan: (financialPlan: IFinancialPlan) => Promise<void>;
}

function formatPlanToTimestamp(plan: IFinancialPlan): IFinancialPlan {
  return {
    ...plan,
    fixedExpenses: plan.fixedExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      singleDate: toTimestamp(expense.singleDate),
    })),
    incomes: plan.incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
      date: toTimestamp(income.date),
    })),
    financialSnapshots: plan.financialSnapshots.map((x) => ({
      ...x,
      surplus: Number(x.surplus),
      date: toTimestamp(x.date),
      debts: x.debts.map((debt) => ({
        ...debt,
        pendingDebt: Number(debt.pendingDebt),
        annualInterest: Number(debt.annualInterest),
        minimumPayment: Number(debt.minimumPayment),
        startDate: toTimestamp(debt.startDate),
      })),
    })),
  };
}

function formatPlanToDayjs(plan: IFinancialPlan): IFinancialPlan {
  return {
    ...plan,
    fixedExpenses: plan.fixedExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      singleDate: toDayjs(expense.singleDate),
    })),
    incomes: plan.incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
      date: toDayjs(income.date),
    })),
    financialSnapshots: plan.financialSnapshots.map((x) => ({
      ...x,
      surplus: Number(x.surplus),
      date: toDayjs(x.date),
      debts: x.debts.map((debt) => ({
        ...debt,
        pendingDebt: Number(debt.pendingDebt),
        annualInterest: Number(debt.annualInterest),
        minimumPayment: Number(debt.minimumPayment),
        startDate: toDayjs(debt.startDate),
      })),
    })),
  };
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

          return formatPlanToDayjs({ id: docSnap.id, ...data });
        });

        setFinancialPlans(plans);
      } catch (err) {
        console.error(err);
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

        const { id, ...formattedFinancialPlan } =
          formatPlanToTimestamp(financialPlan);

        formattedFinancialPlan.incomes.forEach((income, index, arr) => {
          if (income.period !== 'single' && income.period !== 'yearly') {
            delete arr[index].date;
          }
        });

        formattedFinancialPlan.fixedExpenses.forEach((expense, index, arr) => {
          if (expense.expenseType !== 'single') {
            delete arr[index].singleDate;
          }
        });

        await setDoc(docRef, formattedFinancialPlan);

        const formattedFinancialPlanDayjs = formatPlanToDayjs(financialPlan);

        setFinancialPlans((prevState) =>
          id
            ? prevState.map((plan) =>
                plan.id === id ? formattedFinancialPlanDayjs : plan
              )
            : [...prevState, { ...formattedFinancialPlanDayjs, id: docRef.id }]
        );
      } catch (err) {
        console.error(err);
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
