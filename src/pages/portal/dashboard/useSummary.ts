import { useEffect, useState } from 'react';

import { CALLABLE_FUNCTION_NAMES } from '@shared/consts/callableFunctions';
import { ICallableRequest, ICallableResponse } from '@shared/models';
import { ISummary } from '@shared/models/dashboard';
import { httpsCallable } from 'firebase/functions';
import { CommonFetchHookProps } from 'src/_models';
import { ENV } from 'src/consts';
import { useAuth } from 'src/context/hooks';
import { functions } from 'src/firebase';
import { MOCKED_SUMMARY } from 'src/mock/dashboardMockData';

type Props = {
  data: ISummary | null;
  get: () => Promise<ISummary | null>;
  error: string | null;
  loading: boolean;
};

const _dashboardSummaryCallable = httpsCallable<
  ICallableRequest,
  ICallableResponse<ISummary>
>(functions, CALLABLE_FUNCTION_NAMES.dashboardSummary);

const useSummary = (
  { autoLoad, forceMock }: CommonFetchHookProps = {
    autoLoad: true,
    forceMock: false,
  }
): Props => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<ISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);

    if (ENV.USE_MOCKED_DATA || forceMock) {
      setData(MOCKED_SUMMARY);
      setLoading(false);
      return MOCKED_SUMMARY;
    }

    try {
      const response = await _dashboardSummaryCallable({
        uid: currentUser!.uid,
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      setData(response.data.data);
      return MOCKED_SUMMARY;
    } catch (ex) {
      console.error(ex);
      setError('Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoLoad) return;

    fetchData();
  }, [autoLoad, forceMock]);

  const get = fetchData;

  return {
    get,
    data,
    loading,
    error,
  };
};

export default useSummary;
