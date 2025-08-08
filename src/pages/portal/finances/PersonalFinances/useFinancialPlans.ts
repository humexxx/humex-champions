import { useEffect, useState, useCallback, useMemo } from 'react';

import { IFinancialPlan } from '@shared/models/finances';
import { CommonFetchHookProps } from 'src/_models';
import { useAuth } from 'src/context/hooks';
import { createFinancialPlansService } from 'src/services/finances';

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

  // Crear el servicio basado en la configuración
  const service = useMemo(
    () => createFinancialPlansService(forceMock),
    [forceMock]
  );

  useEffect(() => {
    if (!autoLoad || !currentUser) return;

    setLoading(true);

    const unsubscribe = service.subscribe(
      currentUser.uid,
      (plans: IFinancialPlan[]) => {
        setData(plans);
        setLoading(false);
        setError(null);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoLoad, currentUser, service]);

  const get = useCallback(
    async (id: string) => {
      if (!currentUser) throw new Error('User not authenticated');
      return await service.get(currentUser.uid, id);
    },
    [currentUser, service]
  );

  const getAll = useCallback(async () => {
    if (!currentUser) throw new Error('User not authenticated');
    return await service.getAll(currentUser.uid);
  }, [currentUser, service]);

  const set = useCallback(
    async (data: IFinancialPlan) => {
      if (!currentUser) throw new Error('User not authenticated');
      return await service.set(currentUser.uid, data);
    },
    [currentUser, service]
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
