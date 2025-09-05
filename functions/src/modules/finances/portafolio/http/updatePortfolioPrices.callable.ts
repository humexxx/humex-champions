import { ICallableRequest, ICallableResponse } from '@shared/models';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { updatePortfolioWithCurrentPrices } from '../../finances.service';
import { UpdatePortfolioPricesInput } from '../../finances.validators';

interface UpdateResult {
  updatedPositions: number;
  totalValue: number;
}

export const updatePortfolioPricesCallable = onCall<
  ICallableRequest<UpdatePortfolioPricesInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds * 2 }, // Longer timeout for portfolio updates
  async (req): Promise<ICallableResponse<UpdateResult>> => {
    try {
      const uid = requireAuth(req);

      const input = parseOrThrow(UpdatePortfolioPricesInput, req.data);
      const result = await updatePortfolioWithCurrentPrices(
        input.portfolioId,
        uid,
        input.forceRefresh
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
