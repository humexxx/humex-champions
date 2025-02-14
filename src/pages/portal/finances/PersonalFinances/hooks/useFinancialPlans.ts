import { useEffect, useState, useCallback, useMemo } from 'react';

import { FIRESTORE_PATHS } from '@shared/consts';
import { IFinancialPlan } from '@shared/models/finances';
import { getError } from '@shared/utils';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { USE_MOCKED_DATA } from 'src/consts';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { MOCKED_FINANCIAL_PLAN } from 'src/services/mockService';
import { normalizeObjectDates, toDayjs, toTimestamp } from 'src/utils';

interface UsePersonalFinances {
  data: IFinancialPlan[];
  loading: boolean;
  error: string | null;
  set: (financialPlan: IFinancialPlan) => Promise<void>;
  get: (id: string) => Promise<IFinancialPlan>;
  getAll: () => Promise<IFinancialPlan[]>;
}

const useFinancialPlans = (
  { autoLoad }: { autoLoad: boolean } = { autoLoad: true }
): UsePersonalFinances => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<IFinancialPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectionRef = useMemo(() => {
    return collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(currentUser!.uid)
    );
  }, [currentUser]);

  useEffect(() => {
    if (!autoLoad) return;

    if (USE_MOCKED_DATA) {
      setData([MOCKED_FINANCIAL_PLAN]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snap) => {
        if (snap.empty) {
          setData([]);
          setLoading(false);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<IFinancialPlan>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        setData(data);
        setLoading(false);
      },
      (error) => {
        setError(getError(error));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoLoad, collectionRef]);

  const get = useCallback(
    async (id: string) => {
      if (USE_MOCKED_DATA) {
        return { ...MOCKED_FINANCIAL_PLAN, id };
      }

      const docRef = doc(firestore, collectionRef.path, id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        throw new Error('No data found');
      }

      return normalizeObjectDates<IFinancialPlan>(
        { id: snap.id, ...snap.data() },
        toDayjs
      );
    },
    [collectionRef]
  );

  const getAll = useCallback(async () => {
    if (USE_MOCKED_DATA) {
      return [MOCKED_FINANCIAL_PLAN];
    }

    const snap = await getDocs(collectionRef);
    if (snap.empty) {
      return [];
    }

    return snap.docs.map((doc) =>
      normalizeObjectDates<IFinancialPlan>(
        { id: doc.id, ...doc.data() },
        toDayjs
      )
    );
  }, [collectionRef]);

  const set = useCallback(
    async (data: IFinancialPlan) => {
      if (USE_MOCKED_DATA) {
        Object.assign(MOCKED_FINANCIAL_PLAN, data);
        return;
      }

      const docRef = data.id
        ? doc(firestore, collectionRef.path, data.id)
        : doc(collectionRef);

      const { id, ..._data } = normalizeObjectDates<IFinancialPlan>(
        data,
        toTimestamp
      );

      return await setDoc(docRef, _data);
    },
    [collectionRef]
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
