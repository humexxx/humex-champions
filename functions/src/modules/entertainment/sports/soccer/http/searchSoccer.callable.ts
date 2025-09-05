import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { SearchSoccerInput } from '../../../entertainment.validators';
import { searchSoccer } from '../soccer.service';

export const searchSoccerCallable = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      await requireAuth(request);
      const { query, type } = parseOrThrow(SearchSoccerInput, request.data);

      return await searchSoccer(query, type);
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
