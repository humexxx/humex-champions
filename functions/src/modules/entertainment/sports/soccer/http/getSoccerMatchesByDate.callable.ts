import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { getSoccerMatchesByDate } from '../soccer.service';

const RequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export const getSoccerMatchesByDateCallable = onCall(
  { 
    region: 'us-central1',
    enforceAppCheck: true 
  },
  async (request) => {
    try {
      const { date } = parseOrThrow(RequestSchema, request.data);
      
      const matches = await getSoccerMatchesByDate(date);
      
      return {
        success: true,
        data: matches
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
