import { ApproveTransactionInputSchema } from '@shared/schemas/finances';
import {
  ApproveTransactionInput,
  ApproveTransactionOutput,
} from '@shared/types/finances/portfolio';
import { onCall } from 'firebase-functions/v2/https';

import { requireAdmin, requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { approveTransaction } from '../portafolio.service';

export const approveTransactionCallable = onCall<
  ApproveTransactionInput,
  Promise<ApproveTransactionOutput>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (request) => {
    try {
      // Verify authentication and admin privileges
      const approvedByUserId = requireAuth(request);
      requireAdmin(request);

      // Validate input data against schema
      const { userId, portfolioId, transactionId } = parseOrThrow(
        ApproveTransactionInputSchema,
        request.data
      );

      // Delegate to service layer for business logic
      const result = await approveTransaction(
        userId,
        portfolioId,
        transactionId,
        approvedByUserId
      );

      return {
        success: result,
      };
    } catch (error) {
      console.error('Error in approveTransactionCallable:', error);
      throw mapToHttpsError(error);
    }
  }
);
