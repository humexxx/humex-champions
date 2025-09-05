import { onCall } from 'firebase-functions/v2/https';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { SearchSoccerTeamsInput } from '../../../entertainment.validators';
import { searchSoccerTeams } from '../soccer.service';

/**
 * Search for soccer teams by name
 * HTTP Callable Function
 */
export const searchSoccerTeamsCallable = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const input = parseOrThrow(SearchSoccerTeamsInput, request.data);
      const result = await searchSoccerTeams(input.teamName);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
