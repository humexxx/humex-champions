import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../core/auth';
import { mapToHttpsError } from '../../../core/errors';
import { parseOrThrow } from '../../../core/validation';
import { GetSoccerTeamInfoInput } from '../entertainment.validators';
import { getSoccerTeamInfo } from '../soccer.service';

export const getSoccerTeamInfoCallable = onCall(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      await requireAuth(request);
      const { teamId } = parseOrThrow(GetSoccerTeamInfoInput, request.data);

      return await getSoccerTeamInfo(teamId);
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
