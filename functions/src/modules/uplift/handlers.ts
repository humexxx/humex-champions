import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { requireAdmin, requireAuth } from '../../core/auth';
import { runtime } from '../../core/config';
import { mapToHttpsError } from '../../core/errors';
import { parseOrThrow } from '../../core/validation';
import { UpliftService } from './uplift.service';
import {
  adminChecklistReportRequestSchema,
  getUpliftDailyStatsRequestSchema,
  getUpliftOverallStatsRequestSchema,
  type GetUpliftDailyStatsRequest,
} from './validators';

/**
 * Callable function to get daily uplift statistics
 */
export const getUpliftDailyStats = onCall(runtime, async (request) => {
  try {
    const userId = requireAuth(request);
    const { date: dateString }: GetUpliftDailyStatsRequest = parseOrThrow(
      getUpliftDailyStatsRequestSchema,
      request.data || {}
    );

    const date = dateString ? new Date(dateString) : undefined;
    const stats = await UpliftService.getDailyStats(userId, date);

    return { success: true, data: stats };
  } catch (error) {
    throw mapToHttpsError(error);
  }
});

/**
 * Callable function to get overall uplift statistics
 */
export const getUpliftOverallStats = onCall(runtime, async (request) => {
  try {
    const userId = requireAuth(request);
    parseOrThrow(getUpliftOverallStatsRequestSchema, request.data || {});

    const stats = await UpliftService.generateOverallStats(userId);

    return { success: true, data: stats };
  } catch (error) {
    throw mapToHttpsError(error);
  }
});

/**
 * Admin callable function to process checklist report
 */
export const adminChecklistReport = onCall(runtime, async (request) => {
  try {
    requireAdmin(request);
    const userId = requireAuth(request);
    parseOrThrow(adminChecklistReportRequestSchema, request.data || {});

    const result = await UpliftService.processChecklistReport(userId);

    return { success: true, data: result };
  } catch (error) {
    throw mapToHttpsError(error);
  }
});

/**
 * Scheduled function to generate daily stats for all users
 */
export const generateDailyUpliftStats = onSchedule(
  {
    schedule: '0 6 * * *', // Every day at 6 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
  },
  async () => {
    try {
      await UpliftService.generateDailyStatsForAllUsers();
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);

/**
 * Scheduled function for hourly checklist report processing
 */
export const checklistReportGeneration = onSchedule(
  {
    schedule: 'every 1 hours',
    timeZone: 'UTC',
    region: 'us-central1',
  },
  async () => {
    try {
      await UpliftService.processHourlyChecklistReports();
    } catch (error) {
      throw mapToHttpsError(error);
    }
  }
);
