import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// System assets definition - later this will come from database
const SYSTEM_ASSETS = [
  {
    symbol: 'HUMEX-YIELD',
    name: 'HumEx Monthly Yield Fund',
    type: 'system',
    price: 100, // Base price
    change: 0,
    changePercent: 0,
    isSystemAsset: true,
    monthlyYield: 0.007, // 0.7% monthly
    description: 'Fixed monthly yield of 0.7% with compound interest',
    riskLevel: 'low',
    exchange: 'HUMEX',
  },
  {
    symbol: 'HUMEX-GROWTH',
    name: 'HumEx Growth Fund',
    type: 'system',
    price: 150, // Base price
    change: 0,
    changePercent: 0,
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
    type: 'system',
    price: 50, // Base price
    change: 0,
    changePercent: 0,
    isSystemAsset: true,
    monthlyYield: 0.004, // 0.4% monthly
    description: 'Conservative investment with stable monthly returns',
    riskLevel: 'low',
    exchange: 'HUMEX',
  },
];

/**
 * Get system assets available for investment
 * These are internal HumEx investment products
 */
export const getSystemAssetsCallable = onCall(async () => {
  try {
    logger.info('Getting system assets');

    // In the future, this will query the database
    // For now, return the static array
    const assets = SYSTEM_ASSETS.map((asset) => ({
      ...asset,
      // You could add real-time data here if needed
      lastUpdated: new Date().toISOString(),
    }));

    logger.info(`Found ${assets.length} system assets`);

    return {
      success: true,
      assets,
      count: assets.length,
    };
  } catch (error) {
    logger.error('Error getting system assets:', error);
    throw new HttpsError('internal', 'Failed to get system assets');
  }
});
