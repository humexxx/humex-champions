import { IAsset, SearchTradableAssetsInput } from '@shared/types/finances';
import { ICallableResponse } from '@shared/types/functions';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { parseOrThrow } from '../../../../core/validation';
import { searchTradableAssets } from '../../finances.service';

// System assets definition - later this will come from database
const SYSTEM_ASSETS: IAsset[] = [
  {
    symbol: 'HUMEX-YIELD',
    name: 'HumEx Monthly Yield Fund',
    market: 'system',
    isActive: true,

    isSystemAsset: true,
    monthlyYield: 0.007, // 0.7% monthly
    description: 'Fixed monthly yield of 0.7% with compound interest',
    riskLevel: 'low',
    exchange: 'HUMEX',
  },
  {
    symbol: 'HUMEX-GROWTH',
    name: 'HumEx Growth Fund',
    market: 'system',
    isActive: true,

    isSystemAsset: true,
    monthlyYield: 0.012, // 1.2% monthly
    description:
      'Higher yield with moderate risk for growth-oriented investors',
    riskLevel: 'medium',
    exchange: 'HUMEX',
  },
  {
    symbol: 'HUMEX-STABLE',
    name: 'HumEx Stable Income',
    market: 'system',
    isActive: true,

    isSystemAsset: true,
    monthlyYield: 0.004, // 0.4% monthly
    description: 'Conservative investment with stable monthly returns',
    riskLevel: 'low',
    exchange: 'HUMEX',
  },
];

export const searchTradableAssetsCallable = onCall<SearchTradableAssetsInput>(
  { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
  async (req): Promise<ICallableResponse<IAsset[]>> => {
    try {
      requireAuth(req);

      if (req.data.type === 'system') {
        return {
          success: true,
          data: SYSTEM_ASSETS,
        };
      }
      const input = parseOrThrow(SearchTradableAssetsInput, req.data);

      const result = await searchTradableAssets(
        input.query,
        input.type,
        input.limit
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const httpsError = mapToHttpsError(error);
      return {
        success: false,
        error: httpsError.message,
      };
    }
  }
);
