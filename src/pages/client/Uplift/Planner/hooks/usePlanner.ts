import { useState, useEffect, useMemo, useCallback } from 'react';

import { FIRESTORE_PATHS } from '@shared/consts';
import { IPlanner } from '@shared/models/uplift';
import dayjs, { Dayjs } from 'dayjs';
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { objectDateConverter, toDayjs, toTimestamp } from 'src/utils';

export default function usePlanner() {
  const { currentUser } = useAuth();
  const [plannerList, setPlannerList] = useState<IPlanner<Dayjs>[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = useMemo(() => new Date(), []);

  const plannerCollection = useMemo(() => {
    if (!currentUser) return null;
    return collection(
      firestore,
      FIRESTORE_PATHS.UPLIFT.PLANNER(currentUser.uid)
    );
  }, [currentUser]);

  useEffect(() => {
    if (!plannerCollection) return;

    setLoading(true);
    const today = dayjs();
    const startOfWeek = today.startOf('week');

    const startOfDay = new Date(
      startOfWeek.year(),
      startOfWeek.month(),
      startOfWeek.date(),
      0,
      0,
      0
    );

    const endOfWeek = today.endOf('week');
    const endOfDay = new Date(
      endOfWeek.year(),
      endOfWeek.month(),
      endOfWeek.date(),
      23,
      59,
      59
    );

    const q = query(
      plannerCollection,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const plannerList = snapshot.docs.map((doc) => {
            const docData = doc.data();
            docData.id = doc.id;
            return objectDateConverter(docData, toDayjs);
          }) as IPlanner<Dayjs>[];

          setPlannerList(plannerList);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Error fetching checklist');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [plannerCollection, currentDate]);

  return { plannerList, loading, error };
}
