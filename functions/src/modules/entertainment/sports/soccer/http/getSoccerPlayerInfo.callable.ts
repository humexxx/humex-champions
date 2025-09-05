import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { mapToHttpsError } from '../../../../../core/errors';
import { parseOrThrow } from '../../../../../core/validation';
import { getSoccerPlayerInfo } from '../soccer.service';

const RequestSchema = z.object({
  playerId: z.string().min(1),
});

export const getSoccerPlayerInfoCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async (request) => {
    try {
      const { playerId } = parseOrThrow(RequestSchema, request.data);

      const playerInfo = await getSoccerPlayerInfo(playerId);

      return {
        success: true,
        data: playerInfo,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
