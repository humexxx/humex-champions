import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { getWatchlistPrices } from '../../finances.service';

const RequestSchema = z.object({
  symbols: z.array(z.string()).min(1).max(20),
});

export const getWatchlistPricesCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { symbols } = parseOrThrow(RequestSchema, request.data);

      const prices = await getWatchlistPrices(symbols);

      return {
        success: true,
        data: prices,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
