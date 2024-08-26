import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from 'src/context/auth';
import { IChecklist, IChecklistItem } from 'src/models/uplift';
import { firestore } from 'src/firebase';
import { toTimestamp } from 'src/utils';

export function useChecklist() {
  const { currentUser } = useAuth();
  const [checklist, setChecklist] = useState<IChecklist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = useMemo(() => new Date(), []);

  const checklistCollection = useMemo(() => {
    if (!currentUser) return null;
    return collection(firestore, 'uplift', currentUser.uid, 'checklist');
  }, [currentUser]);

  useEffect(() => {
    if (!checklistCollection) return;

    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      23,
      59,
      59
    );

    const q = query(
      checklistCollection,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          docData.id = snapshot.docs[0].id;
          setChecklist(docData as IChecklist);
        } else {
          const newChecklist: IChecklist = {
            date: toTimestamp(currentDate),
            items: [],
          };
          addDoc(checklistCollection, newChecklist)
            .then((doc) => {
              setChecklist({ ...newChecklist, id: doc.id });
            })
            .catch((err) => {
              setError(err.message || 'Error creating new checklist');
            });
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Error fetching checklist');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [checklistCollection, currentDate]);

  const addItem = useCallback(
    async (name: string) => {
      if (!checklist) return;

      const checklistDocRef = doc(
        firestore,
        'uplift',
        currentUser!.uid,
        'checklist',
        checklist.id!
      );

      const newItem: IChecklistItem = { name, completed: false };
      const updatedItems = [...checklist.items, newItem];
      await updateDoc(checklistDocRef, { items: updatedItems });
    },
    [checklist, currentUser]
  );

  const toggleItemCompletion = useCallback(
    async (index: number) => {
      if (!checklist) return;

      const checklistDocRef = doc(
        firestore,
        'uplift',
        currentUser!.uid,
        'checklist',
        checklist.id!
      );

      const updatedItems = [...checklist.items];
      updatedItems[index].completed = !updatedItems[index].completed;
      await updateDoc(checklistDocRef, { items: updatedItems });
    },
    [checklist, currentUser]
  );

  return { checklist, loading, error, addItem, toggleItemCompletion };
}
