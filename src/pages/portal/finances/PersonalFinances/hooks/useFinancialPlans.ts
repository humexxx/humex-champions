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
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { objectDateConverter, toDayjs, toTimestamp } from 'src/utils';

interface UsePersonalFinances {
  data: IFinancialPlan[] | null;
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
  const [data, setData] = useState<IFinancialPlan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const collectionRef = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return collection(
      firestore,
      FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(currentUser.uid)
    );
  }, [currentUser]);

  useEffect(() => {
    if (!autoLoad || !collectionRef) {
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

        const data = snap.docs.map((doc) => {
          const _data = objectDateConverter(
            doc.data(),
            toDayjs
          ) as IFinancialPlan;
          return { id: doc.id, ..._data };
        });

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
      if (!collectionRef) throw new Error('No collectionRef found');

      const docRef = doc(firestore, collectionRef.path, id);

      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        throw new Error('No data found');
      }

      return objectDateConverter(
        { id: snap.id, ...snap.data() },
        toDayjs
      ) as IFinancialPlan;
    },
    [collectionRef]
  );

  const getAll = useCallback(async () => {
    if (!collectionRef) throw new Error('No collectionRef found');

    const snap = await getDocs(collectionRef);

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((doc) => {
      const _data = objectDateConverter(doc.data(), toDayjs) as IFinancialPlan;
      return { id: doc.id, ..._data };
    });
  }, [collectionRef]);

  const set = useCallback(
    async (data: IFinancialPlan) => {
      if (!collectionRef) throw new Error('No collectionRef found');
      const docRef = data.id
        ? doc(firestore, collectionRef.path, data.id)
        : doc(collectionRef);

      delete data.id;
      const _data = objectDateConverter(data, toTimestamp) as IFinancialPlan;

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
