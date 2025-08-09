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
import { firestore } from 'src/firebase';
import { normalizeObjectDates, toDayjs, toTimestamp } from 'src/utils';

export const financialPlansService = {
  getCollection: (userId: string) =>
    collection(firestore, FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(userId)),

  subscribe: (
    userId: string,
    onSuccess: (plans: IFinancialPlan[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = financialPlansService.getCollection(userId);

    return onSnapshot(
      collectionRef,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<IFinancialPlan>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  get: async (userId: string, id: string): Promise<IFinancialPlan> => {
    const collectionRef = financialPlansService.getCollection(userId);
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

  getAll: async (userId: string): Promise<IFinancialPlan[]> => {
    const collectionRef = financialPlansService.getCollection(userId);
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
  },

  set: async (userId: string, data: IFinancialPlan): Promise<void> => {
    const collectionRef = financialPlansService.getCollection(userId);
    const docRef = data.id
      ? doc(firestore, collectionRef.path, data.id)
      : doc(collectionRef);

    const { id: _id, ..._data } = normalizeObjectDates<IFinancialPlan>(
      data,
      toTimestamp
    );

    return await setDoc(docRef, _data);
  },
};
