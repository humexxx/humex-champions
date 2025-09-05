import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { GetF1ScheduleInput } from '../entertainment.validators';
import { getF1Schedule } from '../f1.service';

export const getF1ScheduleCallable = onCall<
  ICallableRequest<GetF1ScheduleInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetF1ScheduleInput, req.data);
      const result = await getF1Schedule(input.year);

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
