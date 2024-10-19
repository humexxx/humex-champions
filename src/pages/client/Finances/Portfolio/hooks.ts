import { useCallback, useEffect, useMemo, useState } from 'react';

import { IPortfolioSnapshot } from '@shared/models/finances';
import { IInstrument } from '@shared/models/instruments';
import { Dayjs } from 'dayjs';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
} from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { objectDateConverter, toDayjs, toTimestamp } from 'src/utils';

interface UserPortfolioResult {
  portfolioSnapshots: IPortfolioSnapshot<Dayjs>[];
  initPortfolio: (
    portfolioSnapshot: IPortfolioSnapshot<Dayjs>
  ) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

interface InstrumentsResult {
  instruments: IInstrument[];
  isLoading: boolean;
  error: Error | null;
}

export const usePortfolio = (): UserPortfolioResult => {
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<
    IPortfolioSnapshot<Dayjs>[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuth();

  const collectionRef = useMemo(
    () => collection(firestore, 'finances', user.currentUser!.uid, 'portfolio'),
    [user.currentUser]
  );

  useEffect(() => {
    const fetchUserPortfolioSnapshots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const _query = query(collectionRef, orderBy('date', 'desc'), limit(4));
        const querySnapshot = await getDocs(_query);

        if (querySnapshot.empty) {
          setPortfolioSnapshots([]);
          return;
        }

        const portfolioSnapshots: IPortfolioSnapshot<Dayjs>[] =
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as IPortfolioSnapshot<Dayjs>),
          }));

        setPortfolioSnapshots(objectDateConverter(portfolioSnapshots, toDayjs));
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.currentUser && collectionRef) {
      fetchUserPortfolioSnapshots();
    }
  }, [user.currentUser, collectionRef]);

  const initPortfolio = useCallback(
    async (portfolioSnapshot: IPortfolioSnapshot<Dayjs>) => {
      setIsLoading(true);
      delete portfolioSnapshot.id;
      try {
        const doc = objectDateConverter(portfolioSnapshot, toTimestamp);
        const response = await addDoc(collectionRef, doc);
        setPortfolioSnapshots([{ id: response.id, ...doc }]);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [collectionRef]
  );

  return {
    error,
    isLoading,
    portfolioSnapshots,
    initPortfolio,
  };
};

export const useInstruments = (): InstrumentsResult => {
  const [instruments, setInstruments] = useState<IInstrument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInstruments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const collectionRef = collection(firestore, 'instruments');
        const querySnapshot = await getDocs(collectionRef);

        if (querySnapshot.empty) {
          setInstruments([]);
          return;
        }

        const instruments: IInstrument[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as IInstrument),
        }));

        setInstruments(instruments);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstruments();
  }, []);

  return {
    error,
    isLoading,
    instruments,
  };
};
