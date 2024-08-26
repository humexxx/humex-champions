import { useState, useEffect } from 'react';
import {
  getFirestore,
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

export function useChecklist(date: Date = new Date()) {
  const { currentUser } = useAuth();
  const [checklist, setChecklist] = useState<IChecklist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const checklistCollection = collection(
      firestore,
      'uplift',
      currentUser.uid,
      'checklist'
    );
    const q = query(checklistCollection, where('date', '==', date));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          setChecklist(docData as IChecklist);
        } else {
          const newChecklist: IChecklist = {
            date: toTimestamp(date),
            items: [],
          };
          addDoc(checklistCollection, newChecklist)
            .then(() => {
              setChecklist(newChecklist);
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
  }, [currentUser, date]);

  const addItem = async (name: string) => {
    if (!currentUser || !checklist) return;

    const db = getFirestore();
    const checklistDocRef = doc(
      db,
      'uplift',
      currentUser.uid,
      'checklist',
      checklist!.date.toString()
    );

    const newItem: IChecklistItem = { name, completed: false };
    const updatedItems = [...checklist.items, newItem];
    await updateDoc(checklistDocRef, { items: updatedItems });
  };

  const toggleItemCompletion = async (index: number) => {
    if (!currentUser || !checklist) return;

    const db = getFirestore();
    const checklistDocRef = doc(
      db,
      'uplift',
      currentUser.uid,
      'checklist',
      checklist!.date.toString()
    );

    const updatedItems = [...checklist.items];
    updatedItems[index].completed = !updatedItems[index].completed;
    await updateDoc(checklistDocRef, { items: updatedItems });
  };

  return { checklist, loading, error, addItem, toggleItemCompletion };
}
