import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../../core/auth';
import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { GetSoccerStandingsInput } from '../../../entertainment.validators';
import { getSoccerStandings } from '../soccer.service';

export const getSoccerStandingsCallable = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      await requireAuth(request);
      const { leagueId, season } = parseOrThrow(
        GetSoccerStandingsInput,
        request.data
      );

      return await getSoccerStandings(leagueId, season);
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
