import { useState, useEffect, useMemo, useCallback } from 'react';

import { FIRESTORE_PATHS } from '@shared/consts/firebase';
import { ISettings } from '@shared/models/settings';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from 'src/context/hooks';
import { firestore } from 'src/firebase';

interface UseUserSettings {
  settings: ISettings | undefined;
  loading: boolean;
  error: Error | null;
  update: (data: Partial<ISettings>) => Promise<void>;
}

export const useUserSettings = (): UseUserSettings => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<ISettings>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const ref = useMemo(
    () => doc(firestore, FIRESTORE_PATHS.USERS(currentUser!.uid)),
    [currentUser]
  );

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userDoc = await getDoc(ref);
        const userData = userDoc.data() as ISettings;
        setSettings(userData);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [ref]);

  const update = useCallback(
    async (data: Partial<ISettings>) => {
      setLoading(true);
      try {
        await updateDoc(ref, { ...data });
        setSettings((prev) => ({ ...prev, ...data }) as ISettings);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    [ref]
  );

  return { settings, update, error, loading };
};
