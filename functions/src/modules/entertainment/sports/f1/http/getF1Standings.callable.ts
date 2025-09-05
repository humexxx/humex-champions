import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { runtime } from '../../../../../core/config';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetF1StandingsInput } from '../../../entertainment.validators';
import { getF1Standings } from '../f1.service';

export const getF1StandingsCallable = onCall<
  ICallableRequest<GetF1StandingsInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetF1StandingsInput, req.data);
      const result = await getF1Standings(input.year, input.type);

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
