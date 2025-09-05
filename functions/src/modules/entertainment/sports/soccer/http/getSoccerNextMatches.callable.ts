import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { getSoccerNextMatches } from '../soccer.service';

const RequestSchema = z.object({
  teamId: z.string().min(1),
});

export const getSoccerNextMatchesCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { teamId } = parseOrThrow(RequestSchema, request.data);

      const matches = await getSoccerNextMatches(teamId);

      return {
        success: true,
        data: matches,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
