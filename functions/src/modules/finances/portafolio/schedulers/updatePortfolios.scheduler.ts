import { IAsset, IPortfolioHolding } from '@shared/types/finances';
import { onCall } from 'firebase-functions/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { requireAdmin, requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { generateCorrelationId, log } from '../../../../core/logger';
import {
  updateAssets,
  updateHoldings,
  updatePortfolioSnapshotsAndPortfolios,
} from '../portafolio.service';

// Set global options
setGlobalOptions({ region: 'us-central1' });

const runUpdatePortfolios = async (
  correlationId: string
): Promise<{
  assetsUpdated: IAsset[];
  holdingsUpdated: IPortfolioHolding[];
}> => {
  try {
    log.info('Starting update portfolios scheduler', undefined, correlationId);

    const assetsUpdated = await updateAssets(correlationId);
    const holdingsUpdated = await updateHoldings(assetsUpdated, correlationId);
    await updatePortfolioSnapshotsAndPortfolios(holdingsUpdated, correlationId);

    return {
      assetsUpdated,
      holdingsUpdated,
    };
  } catch (error) {
    throw mapToHttpsError(error, correlationId);
  }
};

// Common scheduler handler function
const createSchedulerHandler = (
  businessLogic: (correlationId: string) => Promise<unknown>
) => {
  return async () => {
    const correlationId = generateCorrelationId();
    await businessLogic(correlationId);
  };
};

// Common callable handler function
const createCallableHandler = <T>(
  businessLogic: (correlationId: string) => Promise<T>
) => {
  return onCall<undefined, Promise<T>>(
    { region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
    async (request) => {
      const correlationId = generateCorrelationId();
      try {
        requireAuth(request);
        requireAdmin(request);
        return await businessLogic(correlationId);
      } catch (error) {
        throw mapToHttpsError(error);
      }
    }
  );
};

export const updatePortfoliosScheduler = onSchedule(
  {
    schedule: '30 9 * * 1-5', // 9:30 AM ET (market open)
    timeZone: 'America/New_York',
    maxInstances: 1,
  },
  createSchedulerHandler(runUpdatePortfolios)
);

export const updatePortfoliosSchedulerClose = onSchedule(
  {
    schedule: '0 16 * * 1-5', // 4:00 PM ET (market close)
    timeZone: 'America/New_York',
    maxInstances: 1,
  },
  createSchedulerHandler(runUpdatePortfolios)
);

export const updatePortfoliosSchedulerCallable =
  createCallableHandler(runUpdatePortfolios);
