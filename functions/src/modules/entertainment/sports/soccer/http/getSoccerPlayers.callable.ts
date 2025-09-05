import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { GetSoccerPlayersInput } from '../entertainment.validators';
import { getSoccerPlayers } from '../soccer.service';

export const getSoccerPlayersCallable = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      await requireAuth(request);
      const { teamId } = parseOrThrow(GetSoccerPlayersInput, request.data);

      return await getSoccerPlayers(teamId);
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
