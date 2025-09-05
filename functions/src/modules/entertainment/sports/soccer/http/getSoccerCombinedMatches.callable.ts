import { onCall } from 'firebase-functions/v2/https';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetSoccerCombinedMatchesInput } from '../../../entertainment.validators';
import { getSoccerCombinedMatches } from '../soccer.service';

/**
 * Gets combined soccer matches data (upcoming and past) optimized for rate limits
 * This function intelligently manages API calls to respect rate limits while providing
 * fresh data when needed and using cached data when appropriate
 * HTTP Callable Function
 */
export const getSoccerCombinedMatchesCallable = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const input = parseOrThrow(GetSoccerCombinedMatchesInput, request.data);
      const result = await getSoccerCombinedMatches(input.leagueId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
