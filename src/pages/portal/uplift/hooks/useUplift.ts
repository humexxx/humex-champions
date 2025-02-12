import { useEffect, useMemo, useState } from 'react';

import { FIRESTORE_PATHS } from '@shared/consts';
import { IUpliftDoc } from '@shared/models/uplift';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';

export interface UseUplift {
  data: IUpliftDoc | null;
  loading: boolean;
  error: string | null;

  set: (uplift: IUpliftDoc) => Promise<void>;
  get: () => Promise<IUpliftDoc>;
}

function useUplift({ sync }: { sync: boolean } = { sync: true }): UseUplift {
  const { currentUser } = useAuth();
  const [data, setData] = useState<IUpliftDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const docRef = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return doc(firestore, FIRESTORE_PATHS.UPLIFT.INDEX(currentUser.uid));
  }, [currentUser]);

  useEffect(() => {
    if (!sync || !docRef) {
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          setData(null);
          setLoading(false);
          return;
        }

        setData(snap.data() as IUpliftDoc);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, sync]);

  async function set(data: IUpliftDoc) {
    if (!docRef) {
      throw new Error('Document reference is not available');
    }

    return await setDoc(docRef, data);
  }

  async function get(): Promise<IUpliftDoc> {
    if (!docRef) {
      throw new Error('Document reference is not available');
    }

    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('No uplift data found');
    }

    return snap.data() as IUpliftDoc;
  }

  return {
    data,
    loading,
    error,

    set,
    get,
  };
}

export default useUplift;
