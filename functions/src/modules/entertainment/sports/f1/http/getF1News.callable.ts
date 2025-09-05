import { onCall } from 'firebase-functions/v2/https';

import { mapToHttpsError } from '../../../../../core/errors';
import { getF1News } from '../f1.service';

export const getF1NewsCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async () => {
    try {
      const news = await getF1News();

      return {
        success: true,
        data: news,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
