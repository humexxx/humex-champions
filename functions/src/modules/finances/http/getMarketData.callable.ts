import { onCall } from 'firebase-functions/v2/https';

import { mapToHttpsError } from '../../../core/errors';
import { PolygonService } from '../../../services/financial/polygon';

const polygonClient = new PolygonService(process.env.POLYGON_API_KEY || '');

export const getMarketDataCallable = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
  },
  async () => {
    try {
      // Get general market data - could be indices like SPY, QQQ, etc.
      const marketData = await polygonClient.getAssetDetails('SPY');

      return {
        success: true,
        data: marketData,
      };
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
