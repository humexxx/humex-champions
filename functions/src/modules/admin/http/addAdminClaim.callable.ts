import { ICallableResponse } from '@shared/types';
import { onCall } from 'firebase-functions/v2/https';

import { requireAdmin, requireAuth } from '../../../core/auth';
import { runtime } from '../../../core/config';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { addAdminClaim } from '../admin.service';
import { AddAdminClaimInput } from '../admin.validators';

export const addAdminClaimCallable = onCall<AddAdminClaimInput>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<{ message: string }>> => {
    try {
      const adminUid = requireAuth(req);
      requireAdmin(req);

      const input = parseOrThrow(AddAdminClaimInput, req.data);
      const result = await addAdminClaim(input.uid, adminUid);

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
