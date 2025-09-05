import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetSoccerTeamsInput } from '../../../entertainment.validators';
import { getSoccerTeams } from '../soccer.service';

export const getSoccerTeamsCallable = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      await requireAuth(request);
      const { leagueName } = parseOrThrow(GetSoccerTeamsInput, request.data);

      return await getSoccerTeams(leagueName);
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
