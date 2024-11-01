import { useState, useMemo, useCallback } from 'react';

import { FIRESTORE_PATHS } from '@shared/consts';
import { IPlanner } from '@shared/models/uplift';
import { Dayjs } from 'dayjs';
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';
import { objectDateConverter, toTimestamp } from 'src/utils';

export default function usePlanner() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const plannerCollection = useMemo(() => {
    if (!currentUser) return null;
    return collection(
      firestore,
      FIRESTORE_PATHS.UPLIFT.PLANNER(currentUser.uid)
    );
  }, [currentUser]);

  const set = useCallback(
    async (planner: IPlanner<Dayjs>) => {
      try {
        if (!plannerCollection) throw new Error('No planner collection');
        const isNew = !planner.id;
        setLoading(true);
        const formmatedPlanner = objectDateConverter(planner, toTimestamp);

        if (isNew) {
          const docRef = await addDoc(plannerCollection, formmatedPlanner);
          planner.id = docRef.id;
        } else {
          const checklistDocRef = doc(
            firestore,
            `${plannerCollection.path}/${planner.id}`
          );
          await updateDoc(checklistDocRef, formmatedPlanner);
        }
      } catch (err: any) {
        setError(err.message || 'Error adding item');
      } finally {
        setLoading(false);
      }
    },
    [plannerCollection]
  );

  return { loading, error, set };
}
