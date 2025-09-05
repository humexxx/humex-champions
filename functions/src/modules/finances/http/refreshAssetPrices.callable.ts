import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { refreshAssetPrices } from '../finances.service';

const RequestSchema = z.object({
  symbols: z.array(z.string()).min(1).max(50),
});

export const refreshAssetPricesCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { symbols } = parseOrThrow(RequestSchema, request.data);

      const result = await refreshAssetPrices(symbols);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
