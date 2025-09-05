import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { getAssetDetails } from '../finances.service';
import { GetAssetDetailsInput } from '../finances.validators';

export const getAssetDetailsCallable = onCall<
  ICallableRequest<GetAssetDetailsInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<unknown>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetAssetDetailsInput, req.data);
      const result = await getAssetDetails(input.symbol);

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
