import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { getF1Standings } from '../f1.service';

const RequestSchema = z.object({
  year: z
    .number()
    .min(2000)
    .max(new Date().getFullYear())
    .optional()
    .default(new Date().getFullYear()),
});

export const getF1ConstructorStandingsCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { year } = parseOrThrow(RequestSchema, request.data);

      const standings = await getF1Standings(year, 'constructors');

      return {
        success: true,
        data: standings,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
