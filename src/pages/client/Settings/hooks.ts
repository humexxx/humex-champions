import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from 'src/context/auth';
import { firestore } from 'src/firebase';
import { ISettings } from 'src/models/settings';

export const useUserSettings = () => {
  const user = useAuth();
  const [settings, setSettings] = useState<ISettings>();

  const ref = useMemo(
    () => doc(firestore, 'users', user.currentUser!.uid),
    [user.currentUser]
  );

  useEffect(() => {
    const fetchUserSettings = async () => {
      const userDoc = await getDoc(ref);
      const userData = userDoc.data() as ISettings;
      setSettings(userData);
    };

    fetchUserSettings();
  }, [ref]);

  const updateTimezone = useCallback(
    async (data: ISettings) => {
      await updateDoc(ref, { ...data });
      setSettings(data);
    },
    [ref]
  );

  return { settings, updateTimezone };
};