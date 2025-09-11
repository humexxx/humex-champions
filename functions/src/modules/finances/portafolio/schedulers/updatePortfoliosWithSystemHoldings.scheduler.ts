import { IPortfolioHolding } from '@shared/types/finances';
import { onCall } from 'firebase-functions/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { requireAdmin, requireAuth } from '../../../../core/auth';
import { runtime } from '../../../../core/config';
import { mapToHttpsError } from '../../../../core/errors';
import { generateCorrelationId, log } from '../../../../core/logger';
import {
  updatePortfolioSnapshotsAndPortfolios,
  updateSystemHoldings,
} from '../portafolio.service';

// Set global options
setGlobalOptions({ region: 'us-central1' });

const runUpdatePortfoliosWithSystemHoldings = async (
  correlationId: string
): Promise<{ holdingsUpdated: IPortfolioHolding[] }> => {
  try {
    log.info(
      'Starting update portfolios with system holdings scheduler',
      undefined,
      correlationId
    );

    const holdingsUpdated = await updateSystemHoldings(correlationId);
    await updatePortfolioSnapshotsAndPortfolios(holdingsUpdated, correlationId);

    return {
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
        throw mapToHttpsError(error, correlationId);
      }
    }
  );
};

export const updatePortfoliosWithSystemHoldingsScheduler = onSchedule(
  {
    schedule: '0 0 1 * *', // At 00:00 on day-of-month 1 (start of each month)
    timeZone: 'UTC',
    maxInstances: 1,
  },
  createSchedulerHandler(runUpdatePortfoliosWithSystemHoldings)
);

export const updatePortfoliosWithSystemHoldingsSchedulerCallable =
  createCallableHandler(runUpdatePortfoliosWithSystemHoldings);
