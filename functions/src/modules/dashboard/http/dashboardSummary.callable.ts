import { ICallableRequest, ICallableResponse } from '@shared/types';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { DashboardService } from '../dashboard.service';
import { GetDashboardSummaryInput } from '../dashboard.validators';

interface DashboardSummaryResponse {
  finance: {
    financeScore: number;
    lastMonth: {
      savingsIncrease: number;
      debtsDecrease: number;
      savingsIncreasePercentage: number;
      debtsDecreasePercentage: number;
    };
    nextTarget: {
      monthsRemaining: number;
      name: string;
    };
  };
}

export const dashboardSummaryCallable = onCall<
  ICallableRequest<GetDashboardSummaryInput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<DashboardSummaryResponse>> => {
    try {
      const uid = requireAuth(req);
      const input = parseOrThrow(GetDashboardSummaryInput, req.data);

      // Ensure the authenticated user matches the requested uid
      if (input.uid !== uid) {
        throw new Error("Unauthorized: Cannot access another user's dashboard");
      }

      const result = await DashboardService.getSummary(uid, input.forceMock);

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
