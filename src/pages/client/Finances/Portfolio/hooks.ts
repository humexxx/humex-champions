import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
} from 'firebase/firestore';
import { IPortfolioSnapshot } from 'src/models/finances';
import { firestore } from 'src/firebase';
import { useAuth } from 'src/context/auth';
import { IInstrument } from 'src/models/instruments';

interface UserPortfolioResult {
  portfolioSnapshots: IPortfolioSnapshot[];
  initPortfolio: (portfolioSnapshot: IPortfolioSnapshot) => Promise<void>;
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
    IPortfolioSnapshot[]
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

        const portfolioSnapshots: IPortfolioSnapshot[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as IPortfolioSnapshot),
          })
        );

        setPortfolioSnapshots(portfolioSnapshots);
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
    async (portfolioSnapshot: IPortfolioSnapshot) => {
      setIsLoading(true);
      delete portfolioSnapshot.id;
      try {
        const response = await addDoc(collectionRef, portfolioSnapshot);
        setPortfolioSnapshots([{ id: response.id, ...portfolioSnapshot }]);
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
