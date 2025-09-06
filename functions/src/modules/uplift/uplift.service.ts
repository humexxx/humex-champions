import { FIRESTORE_PATHS } from '@shared/consts';
import {
  EPathwayCategory,
  ERecommendationType,
  ETodoCategory,
  IDailyStats,
  IOverallStats,
  IRecommendation,
} from '@shared/types/uplift';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';

import { AppError } from '../../core/errors';
import { db } from '../../core/firebase';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export class UpliftService {
  /**
   * Generate daily statistics for a specific user and date
   * @param {string} userId - The user ID to generate stats for
   * @param {Date} date - The date to generate stats for
   * @return {Promise<IDailyStats>} The generated daily statistics
   */
  static async generateDailyStats(
    userId: string,
    date: Date
  ): Promise<IDailyStats> {
    try {
      const dayStart = dayjs(date).startOf('day').toDate();
      const dayEnd = dayjs(date).endOf('day').toDate();
      const dateKey = this.formatDate(date);

      // Get todos for the day - using the main collection
      const todosQuery = db()
        .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(userId))
        .where('date', '>=', dayStart)
        .where('date', '<=', dayEnd);

      const todosSnapshot = await todosQuery.get();

      let totalTasks = 0;
      let completedTasks = 0;
      const categoryBreakdown: Partial<Record<ETodoCategory, number>> = {};
      const priorityBreakdown: Record<string, number> = {};

      todosSnapshot.docs.forEach((doc) => {
        const todoList = doc.data();
        if (todoList.items && Array.isArray(todoList.items)) {
          todoList.items.forEach((item: unknown) => {
            const todoItem = item as {
              completed?: boolean;
              category?: string;
              priority?: string;
            };
            totalTasks++;
            if (todoItem.completed) completedTasks++;

            if (todoItem.category) {
              categoryBreakdown[todoItem.category as ETodoCategory] =
                (categoryBreakdown[todoItem.category as ETodoCategory] || 0) +
                1;
            }
            if (todoItem.priority) {
              priorityBreakdown[todoItem.priority] =
                (priorityBreakdown[todoItem.priority] || 0) + 1;
            }
          });
        }
      });

      const stats: IDailyStats = {
        date,
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        categoryBreakdown: categoryBreakdown as Record<ETodoCategory, number>,
        priorityBreakdown,
      };

      // Save to a dedicated stats collection
      await db()
        .collection('uplift-stats')
        .doc(userId)
        .collection('daily')
        .doc(dateKey)
        .set(stats);

      return stats;
    } catch (error) {
      logger.error('Failed to generate daily stats', { error, userId, date });
      throw new AppError(
        'internal',
        'Failed to generate daily statistics',
        500
      );
    }
  }

  /**
   * Get daily statistics for a user and date
   * @param {string} userId - The user ID to get stats for
   * @param {Date} [date] - The optional date to get stats for (defaults to today)
   * @return {Promise<IDailyStats>} The daily statistics
   */
  static async getDailyStats(
    userId: string,
    date?: Date
  ): Promise<IDailyStats> {
    try {
      const targetDate = date || new Date();
      const dateKey = this.formatDate(targetDate);

      const statsDoc = await db()
        .collection('uplift-stats')
        .doc(userId)
        .collection('daily')
        .doc(dateKey)
        .get();

      if (!statsDoc.exists) {
        // Generate stats for the requested date
        return await this.generateDailyStats(userId, targetDate);
      }

      return statsDoc.data() as IDailyStats;
    } catch (error) {
      logger.error('Failed to get daily stats', { error, userId, date });
      throw new AppError(
        'internal',
        'Failed to retrieve daily statistics',
        500
      );
    }
  }

  /**
   * Generate overall statistics for a user
   * @param {string} userId - The user ID to generate stats for
   * @return {Promise<IOverallStats>} The overall statistics
   */
  static async generateOverallStats(userId: string): Promise<IOverallStats> {
    try {
      const now = new Date();
      const lastMonth = dayjs(now).subtract(30, 'day').toDate();

      // Get recent daily stats for scoring
      const recentStatsQuery = db()
        .collection('uplift-stats')
        .doc(userId)
        .collection('daily')
        .where('date', '>=', lastMonth)
        .orderBy('date', 'desc')
        .limit(30);

      const recentStatsSnapshot = await recentStatsQuery.get();
      const recentStats = recentStatsSnapshot.docs.map(
        (doc) => doc.data() as IDailyStats
      );

      const avgCompletionRate =
        recentStats.length > 0
          ? recentStats.reduce(
              (sum: number, day: IDailyStats) => sum + day.completionRate,
              0
            ) / recentStats.length
          : 0;

      // Calculate scores
      const productivityScore = Math.round(avgCompletionRate);
      const consistencyScore = this.calculateConsistencyScore(recentStats);
      const growthScore = this.calculateGrowthScore(recentStats);

      const stats: IOverallStats = {
        productivityScore,
        consistencyScore,
        growthScore,
        focusAreas: [
          EPathwayCategory.FITNESS,
          EPathwayCategory.MINDFULNESS,
          EPathwayCategory.LEARNING,
        ],
        achievements: [], // TODO: Implement achievement system
        recommendations: this.generateRecommendations(recentStats),
      };

      return stats;
    } catch (error) {
      logger.error('Failed to generate overall stats', { error, userId });
      throw new AppError(
        'internal',
        'Failed to generate overall statistics',
        500
      );
    }
  }

  /**
   * Generate stats for all users (scheduled task)
   */
  static async generateDailyStatsForAllUsers(): Promise<void> {
    try {
      logger.info('Starting daily uplift stats generation for all users');

      const usersSnapshot = await db().collection('users').get();
      const promises = usersSnapshot.docs.map((doc) =>
        this.generateUserStats(doc.id)
      );

      await Promise.all(promises);
      logger.info(`Generated stats for ${usersSnapshot.size} users`);
    } catch (error) {
      logger.error('Failed to generate daily stats for all users', { error });
      throw new AppError(
        'internal',
        'Failed to generate daily statistics for all users',
        500
      );
    }
  }

  /**
   * Process checklist report for a specific user
   * @param {string} userId - The user ID to process report for
   * @return {Promise<object>} The report result
   */
  static async processChecklistReport(
    userId: string
  ): Promise<{ message: string; doc?: Record<string, unknown> }> {
    try {
      logger.info(`Admin generating checklist report: ${userId}`);

      const lastChecklistSnapshot = await db()
        .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(userId))
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (!lastChecklistSnapshot.empty) {
        const lastDoc = lastChecklistSnapshot.docs[0];
        const lastData = lastDoc.data();

        if (lastData.items && lastData.items.length > 0) {
          const completedItems = lastData.items.filter(
            (item: { completed: boolean }) => item.completed
          ).length;

          const totalItems = lastData.items.length;
          const completionPercentage = (completedItems / totalItems) * 100;

          await lastDoc.ref.update({
            completionPercentage: completionPercentage,
          });

          logger.info(
            `Admin checklist completion percentage: ${completionPercentage.toFixed(2)}%`
          );

          // Move uncompleted items to today's checklist
          const uncompletedItems = lastData.items
            .filter((item: { completed: boolean }) => !item.completed)
            .map((item: { completed: boolean; [key: string]: unknown }) => ({
              ...item,
              movedFromYesterday: true,
            }));

          if (uncompletedItems.length > 0) {
            const newDocData = {
              date: admin.firestore.Timestamp.fromDate(new Date()),
              items: uncompletedItems,
            };

            await db()
              .collection(FIRESTORE_PATHS.UPLIFT.CHECKLIST(userId))
              .add(newDocData);

            return {
              message:
                'Checklist report generated successfully with uncompleted items.',
              doc: newDocData,
            };
          }

          return {
            message:
              'Checklist report generated successfully - all items completed',
          };
        }

        throw new AppError(
          'not-found',
          'No items found under the last checklist',
          404
        );
      }

      throw new AppError('not-found', 'No previous snapshot found', 404);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Admin checklist report failed', { error, userId });
      throw new AppError('internal', 'Error generating snapshot', 500);
    }
  }

  /**
   * Process hourly checklist reports for all users
   */
  static async processHourlyChecklistReports(): Promise<void> {
    try {
      logger.info('Checklist report generation started');

      const usersSnapshot = await db().collection('users').get();

      await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          try {
            const userData = userDoc.data();
            const { timezone } = userData;
            const now = new Date();
            const userTime = new Date(
              now.toLocaleString('en-US', { timeZone: timezone })
            );

            if (userTime.getHours() === 0) {
              const lastChecklistSnapshot = await db()
                .collection(`uplift/${userDoc.id}/checklist`)
                .orderBy('date', 'desc')
                .limit(1)
                .get();

              if (!lastChecklistSnapshot.empty) {
                const lastDoc = lastChecklistSnapshot.docs[0];
                const lastData = lastDoc.data();

                if (lastData.date.toDate().getDate() === now.getDate() - 1) {
                  logger.debug(
                    `Processing yesterday's checklist for user: ${userDoc.id}`
                  );

                  if (lastData.items && lastData.items.length > 0) {
                    const completedItems = lastData.items.filter(
                      (item: { completed: boolean }) => item.completed
                    ).length;

                    const totalItems = lastData.items.length;
                    const completionPercentage =
                      (completedItems / totalItems) * 100;

                    await lastDoc.ref.update({
                      completionPercentage: completionPercentage,
                    });

                    logger.info(
                      `Updated completion percentage for user ${userDoc.id}: ${completionPercentage.toFixed(2)}%`
                    );

                    // Move uncompleted items to today's checklist
                    const uncompletedItems = lastData.items
                      .filter((item: { completed: boolean }) => !item.completed)
                      .map(
                        (item: {
                          completed: boolean;
                          [key: string]: unknown;
                        }) => ({
                          ...item,
                          movedFromYesterday: true,
                        })
                      );

                    if (uncompletedItems.length > 0) {
                      const newDocData = {
                        date: admin.firestore.Timestamp.fromDate(new Date()),
                        items: uncompletedItems,
                      };

                      await db()
                        .collection(`uplift/${userDoc.id}/checklist`)
                        .add(newDocData);
                    }
                  }
                }
              }
            }
          } catch (userError) {
            logger.error(`Checklist user ${userDoc.id} failed:`, userError);
          }
        })
      );

      logger.info('Checklist report generation completed');
    } catch (error) {
      logger.error('Checklist report generation failed:', error);
      throw new AppError(
        'internal',
        'Failed to process hourly checklist reports',
        500
      );
    }
  }

  // Private helper methods
  private static formatDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  private static async generateUserStats(userId: string): Promise<void> {
    const today = new Date();
    const yesterday = dayjs(today).subtract(1, 'day').toDate();

    // Generate stats for yesterday (complete day)
    await this.generateDailyStats(userId, yesterday);
  }

  private static calculateConsistencyScore(stats: IDailyStats[]): number {
    if (stats.length === 0) return 0;

    const daysWithTasks = stats.filter((day) => day.totalTasks > 0).length;
    const consistencyRate = (daysWithTasks / stats.length) * 100;

    return Math.round(consistencyRate);
  }

  private static calculateGrowthScore(stats: IDailyStats[]): number {
    if (stats.length < 7) return 50; // Default for insufficient data

    const firstWeek = stats.slice(-7);
    const secondWeek = stats.slice(-14, -7);

    if (secondWeek.length === 0) return 50;

    const firstWeekAvg =
      firstWeek.reduce((sum, day) => sum + day.completionRate, 0) /
      firstWeek.length;
    const secondWeekAvg =
      secondWeek.reduce((sum, day) => sum + day.completionRate, 0) /
      secondWeek.length;

    const improvement = firstWeekAvg - secondWeekAvg;
    const growthScore = Math.max(0, Math.min(100, 50 + improvement));

    return Math.round(growthScore);
  }

  private static generateRecommendations(
    stats: IDailyStats[]
  ): IRecommendation[] {
    const recommendations: IRecommendation[] = [];

    if (stats.length > 0) {
      const avgCompletion =
        stats.reduce((sum, day) => sum + day.completionRate, 0) / stats.length;

      if (avgCompletion < 50) {
        recommendations.push({
          id: 'reduce_tasks',
          type: ERecommendationType.FOCUS_AREA,
          title: 'Focus on Fewer Tasks',
          description:
            'Consider reducing daily tasks to improve completion rate',
          priority: 5,
          category: EPathwayCategory.PERSONAL_GROWTH,
        });
      }

      if (avgCompletion > 80) {
        recommendations.push({
          id: 'add_challenge',
          type: ERecommendationType.INCREASE_FREQUENCY,
          title: 'Add More Challenging Goals',
          description:
            "You're doing great! Consider adding more ambitious goals",
          priority: 3,
          category: EPathwayCategory.PERSONAL_GROWTH,
        });
      }
    }

    return recommendations;
  }
}
