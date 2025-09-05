import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { searchTradableAssets } from '../finances.service';
import { SearchTradableAssetsInput } from '../finances.validators';

export const searchTradableAssetsCallable = onCall<
  ICallableRequest<SearchTradableAssetsInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<any>> => {
    try {
      requireAuth(req);

      const input = parseOrThrow(SearchTradableAssetsInput, req.data);
      const result = await searchTradableAssets(
        input.query,
        input.type,
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
