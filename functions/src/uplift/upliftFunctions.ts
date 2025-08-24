import { FIRESTORE_PATHS } from '@shared/consts';
import {
  IOverallStats,
  IDailyStats,
  ETodoCategory,
  EPathwayCategory,
  IRecommendation,
  ERecommendationType,
} from '@shared/models/uplift';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const db = admin.firestore();

// Daily scheduled function to generate statistics for all users
export const generateDailyUpliftStats = onSchedule(
  {
    schedule: '0 6 * * *', // Every day at 6 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
  },
  async () => {
    console.log('Starting daily uplift stats generation');

    try {
      const usersSnapshot = await db.collection('users').get();
      const promises = usersSnapshot.docs.map((doc) =>
        generateUserStats(doc.id)
      );

      await Promise.all(promises);
      console.log(`Generated stats for ${usersSnapshot.size} users`);
    } catch (error) {
      console.error('Error generating daily uplift stats:', error);
      throw error;
    }
  }
);

// Callable function to get daily stats
export const getUpliftDailyStats = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      if (!request.auth?.uid) {
        throw new Error('User must be authenticated');
      }

      const { date: dateString } = request.data || {};
      const date = dateString ? dayjs(dateString).toDate() : new Date();
      const dateKey = formatDate(date);

      const statsDoc = await db
        .doc(FIRESTORE_PATHS.UPLIFT.CHECKLIST(request.auth.uid))
        .collection('daily-stats')
        .doc(dateKey)
        .get();

      if (!statsDoc.exists) {
        // Generate stats for the requested date
        const stats = await generateDailyStats(request.auth.uid, date);
        return { success: true, data: stats };
      }

      return { success: true, data: statsDoc.data() as IDailyStats };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

// Callable function to get overall stats
export const getUpliftOverallStats = onCall(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      if (!request.auth?.uid) {
        throw new Error('User must be authenticated');
      }

      const stats = await generateOverallStats(request.auth.uid);
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

// Helper functions
function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

async function generateUserStats(userId: string): Promise<void> {
  const today = new Date();
  const yesterday = dayjs(today).subtract(1, 'day').toDate();

  // Generate stats for yesterday (complete day)
  await generateDailyStats(userId, yesterday);
}

async function generateDailyStats(
  userId: string,
  date: Date
): Promise<IDailyStats> {
  const dayStart = dayjs(date).startOf('day').toDate();
  const dayEnd = dayjs(date).endOf('day').toDate();
  const dateKey = formatDate(date);

  // Get todos for the day - using the main collection, not subcollection
  const todosQuery = db
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
            (categoryBreakdown[todoItem.category as ETodoCategory] || 0) + 1;
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
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    categoryBreakdown: categoryBreakdown as Record<ETodoCategory, number>,
    priorityBreakdown: priorityBreakdown as Record<string, number>,
  };

  // Save to a dedicated stats collection
  await db
    .collection('uplift-stats')
    .doc(userId)
    .collection('daily')
    .doc(dateKey)
    .set(stats);

  return stats;
}

async function generateOverallStats(userId: string): Promise<IOverallStats> {
  const now = new Date();
  const lastMonth = dayjs(now).subtract(30, 'day').toDate();

  // Get recent daily stats for scoring
  const recentStatsQuery = db
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
  const consistencyScore = calculateConsistencyScore(recentStats);
  const growthScore = calculateGrowthScore(recentStats);

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
    recommendations: generateRecommendations(recentStats),
  };

  return stats;
}

function calculateConsistencyScore(stats: IDailyStats[]): number {
  if (stats.length === 0) return 0;

  const daysWithTasks = stats.filter((day) => day.totalTasks > 0).length;
  const consistencyRate = (daysWithTasks / stats.length) * 100;

  return Math.round(consistencyRate);
}

function calculateGrowthScore(stats: IDailyStats[]): number {
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

function generateRecommendations(stats: IDailyStats[]): IRecommendation[] {
  const recommendations: IRecommendation[] = [];

  if (stats.length > 0) {
    const avgCompletion =
      stats.reduce((sum, day) => sum + day.completionRate, 0) / stats.length;

    if (avgCompletion < 50) {
      recommendations.push({
        id: 'reduce_tasks',
        type: ERecommendationType.FOCUS_AREA,
        title: 'Focus on Fewer Tasks',
        description: 'Consider reducing daily tasks to improve completion rate',
        priority: 5,
        category: EPathwayCategory.PERSONAL_GROWTH,
      });
    }

    if (avgCompletion > 80) {
      recommendations.push({
        id: 'add_challenge',
        type: ERecommendationType.INCREASE_FREQUENCY,
        title: 'Add More Challenging Goals',
        description: "You're doing great! Consider adding more ambitious goals",
        priority: 3,
        category: EPathwayCategory.PERSONAL_GROWTH,
      });
    }
  }

  return recommendations;
}
