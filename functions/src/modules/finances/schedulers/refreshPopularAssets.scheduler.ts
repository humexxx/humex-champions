import { onSchedule } from 'firebase-functions/v2/scheduler';

import { schedulerRuntime } from '../../../core/config';
import { log } from '../../../core/logger';
import { refreshAssetPrices } from '../finances.service';

/**
 * Scheduled function to refresh popular asset prices
 * Runs every 15 minutes during market hours
 */
export const refreshPopularAssetPrices = onSchedule(
  {
    schedule: '*/15 6-22 * * 1-5', // Every 15 minutes, 6 AM to 10 PM, Monday to Friday
    timeZone: 'America/New_York',
    region: schedulerRuntime.region,
    memory: '1GiB',
    timeoutSeconds: schedulerRuntime.timeoutSeconds,
  },
  async () => {
    try {
      log.info('Starting scheduled refresh of popular asset prices');

      // Popular assets to refresh - could be configured externally
      const popularAssets = [
        'AAPL',
        'GOOGL',
        'MSFT',
        'AMZN',
        'TSLA',
        'NVDA',
        'META',
        'NFLX',
        'BTC-USD',
        'ETH-USD',
        'SPY',
        'QQQ',
        'VTI',
        'BND',
      ];

      await refreshAssetPrices(popularAssets);

      log.info('Completed scheduled refresh of popular asset prices', {
        assetsRefreshed: popularAssets.length,
      });
    } catch (error) {
      log.error('Failed to refresh popular asset prices', { error });
      throw error;
    }
  }
);
