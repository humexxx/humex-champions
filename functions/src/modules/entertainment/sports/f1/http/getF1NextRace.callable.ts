import { ICallableResponse } from '@shared/types';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { runtime } from '../../../../../core/config';
import { mapToHttpsError } from '../../../../../core/errors';
import { getF1NextRace } from '../f1.service';

export const getF1NextRaceCallable = onCall(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown>> => {
    try {
      requireAuth(req);

      const result = await getF1NextRace();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const httpsError = mapToHttpsError(error);
      return {
        success: false,
        error: httpsError.message,
      };
    }
  }
);
