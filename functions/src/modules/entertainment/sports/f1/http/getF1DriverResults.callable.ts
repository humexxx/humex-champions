import { ICallableRequest, ICallableResponse } from '@shared/types';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { runtime } from '../../../../../core/config';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetF1DriverResultsInput } from '../../../entertainment.validators';
import { getF1DriverResults } from '../f1.service';

export const getF1DriverResultsCallable = onCall<
  ICallableRequest<GetF1DriverResultsInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown[]>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetF1DriverResultsInput, req.data);
      const result = await getF1DriverResults(
        input.driverCode,
        input.year,
        input.limit
      );

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
