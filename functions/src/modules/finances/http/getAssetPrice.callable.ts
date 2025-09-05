import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { getAssetPrice } from '../finances.service';
import { GetAssetPriceInput } from '../finances.validators';

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export const getAssetPriceCallable = onCall<
  ICallableRequest<GetAssetPriceInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<PriceData>> => {
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
