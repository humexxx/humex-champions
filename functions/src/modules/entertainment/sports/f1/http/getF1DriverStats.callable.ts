import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { getF1DriverStats } from '../f1.service';

const RequestSchema = z.object({
  driverId: z.string().min(1),
  year: z.number().min(2000).max(new Date().getFullYear()).optional(),
});

export const getF1DriverStatsCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { driverId, year } = parseOrThrow(RequestSchema, request.data);

      const stats = await getF1DriverStats(driverId, year);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
