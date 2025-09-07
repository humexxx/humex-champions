import { ICallableResponse } from '@shared/types';
import { GetAssetPriceInput, IPriceData } from '@shared/types/finances';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { getAssetPrice } from '../../finances.service';

export const getAssetPriceCallable = onCall<
  GetAssetPriceInput,
  Promise<ICallableResponse<IPriceData>>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req) => {
    try {
      requireAuth(req);

      const input = parseOrThrow(GetAssetPriceInput, req.data);
      const result = await getAssetPrice(input.symbol);

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
