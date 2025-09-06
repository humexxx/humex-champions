import { ICallableRequest, ICallableResponse } from '@shared/types';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { runtime } from '../../../../../core/config';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetF1DriverInfoInput } from '../../../entertainment.validators';
import { getF1DriverInfo } from '../f1.service';

export const getF1DriverInfoCallable = onCall<
  ICallableRequest<GetF1DriverInfoInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetF1DriverInfoInput, req.data);
      const result = await getF1DriverInfo(input.driverCode, input.year);

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
