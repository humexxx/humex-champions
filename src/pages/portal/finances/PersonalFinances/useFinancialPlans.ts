import { useEffect, useState, useCallback } from 'react';

import { IFinancialPlan } from '@shared/models/finances';
import { CommonFetchHookProps } from 'src/_models';
import { USE_MOCKED_DATA } from 'src/consts';
import { useAuth } from 'src/context/hooks';
import { MOCKED_FINANCIAL_PLANS } from 'src/mock/financeMockData';
import { financialPlansService } from 'src/services/finances/personalFinancesService';

interface UsePersonalFinances {
  data: IFinancialPlan[];
  loading: boolean;
  error: string | null;
  set: (financialPlan: IFinancialPlan) => Promise<void>;
  get: (id: string) => Promise<IFinancialPlan>;
  getAll: () => Promise<IFinancialPlan[]>;
}

const useFinancialPlans = (
  { autoLoad, forceMock }: CommonFetchHookProps = {
    autoLoad: true,
    forceMock: false,
  }
): UsePersonalFinances => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<IFinancialPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoLoad || !currentUser) return;

    if (USE_MOCKED_DATA || forceMock) {
      setData([...MOCKED_FINANCIAL_PLANS]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = financialPlansService.subscribe(
      currentUser.uid,
      (plans) => {
        setData(plans);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoLoad, currentUser, forceMock]);

  const get = useCallback(
    async (id: string) => {
      if (!currentUser) throw new Error('User not authenticated');

      if (USE_MOCKED_DATA || forceMock) {
        const plan = MOCKED_FINANCIAL_PLANS.find((p) => p.id === id);
        if (!plan) {
          throw new Error('No data found');
        }
        return { ...plan, id };
      }

      return await financialPlansService.get(currentUser.uid, id);
    },
    [currentUser, forceMock]
  );

  const getAll = useCallback(async () => {
    if (!currentUser) throw new Error('User not authenticated');

    if (USE_MOCKED_DATA || forceMock) {
      return MOCKED_FINANCIAL_PLANS;
    }

    return await financialPlansService.getAll(currentUser.uid);
  }, [currentUser, forceMock]);

  const set = useCallback(
    async (data: IFinancialPlan) => {
      if (!currentUser) throw new Error('User not authenticated');

      if (USE_MOCKED_DATA || forceMock) {
        if (!data.id) {
          const newPlan = {
            ...data,
            id: `mocked-${Date.now()}`,
          };
          setData((prev) => [...prev, newPlan]);
        } else {
          setData((prev) => prev.map((x) => (x.id === data.id ? data : x)));
        }
        return;
      }

      return await financialPlansService.set(currentUser.uid, data);
    },
    [currentUser, forceMock]
  );

  return {
    get,
    getAll,
    data,
    loading,
    error,
    set,
  };
};

export default useFinancialPlans;
