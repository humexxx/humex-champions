import { AddTransactionInputSchema } from '@shared/schemas/finances';
import { ICallableResponse } from '@shared/types';
import { IAsset, TransactionFormData } from '@shared/types/finances';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { addTransaction } from '../portafolio.service';

export const addTransactionCallable = onCall<
  { asset: IAsset; transactionData: TransactionFormData },
  Promise<ICallableResponse<{ transactionId: string }>>
>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (request) => {
    try {
      // Verify authentication
      const userId = requireAuth(request);

      // Validate input data against schemas
      const { transactionData, asset } = parseOrThrow(
        AddTransactionInputSchema,
        request.data
      );

      // Delegate to service layer for business logic
      const result = await addTransaction(userId, transactionData, asset);

      return {
        success: true,
        data: { transactionId: result.transactionId },
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
