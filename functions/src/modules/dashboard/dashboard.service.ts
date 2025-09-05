import { ISummary } from '@shared/models/dashboard';

import { log } from '../../core/logger';

/**
 * Dashboard Service
 * Handles dashboard data aggregation and summary generation
 */
export class DashboardService {
  static async getSummary(uid: string, forceMock = false): Promise<ISummary> {
    log.info('Getting dashboard summary', { uid, forceMock });

    // For now, return mock data
    // TODO: Implement real data aggregation from user's financial data
    const mockSummary: ISummary = {
      finance: {
        financeScore: 85,
        lastMonth: {
          savingsIncrease: 1250.5,
          debtsDecrease: 350.75,
          savingsIncreasePercentage: 12.5,
          debtsDecreasePercentage: 8.2,
        },
        nextTarget: {
          monthsRemaining: 8,
          name: 'Emergency Fund Goal',
        },
      },
    };

    // In the future, if forceMock is false, we would:
    // 1. Query user's portfolios and financial data
    // 2. Calculate actual finance score based on savings/debt ratios
    // 3. Compare with previous month's data
    // 4. Determine next financial target based on user's goals

    if (!forceMock) {
      // TODO: Implement real data aggregation
      log.info(
        'Real data aggregation not yet implemented, returning mock data',
        { uid }
      );
    }

    log.info('Dashboard summary generated successfully', {
      uid,
      financeScore: mockSummary.finance.financeScore,
    });

    return mockSummary;
  }
}
