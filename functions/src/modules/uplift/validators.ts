import { z } from 'zod';

// Request schemas
export const getUpliftDailyStatsRequestSchema = z.object({
  date: z.string().optional(),
});

export const getUpliftOverallStatsRequestSchema = z.object({});

export const adminChecklistReportRequestSchema = z.object({});

// Response schemas
export const dailyStatsResponseSchema = z.object({
  date: z.date(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionRate: z.number(),
  categoryBreakdown: z.record(z.string(), z.number()),
  priorityBreakdown: z.record(z.string(), z.number()),
});

export const overallStatsResponseSchema = z.object({
  productivityScore: z.number(),
  consistencyScore: z.number(),
  growthScore: z.number(),
  focusAreas: z.array(z.string()),
  achievements: z.array(z.any()),
  recommendations: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.number(),
      category: z.string(),
    })
  ),
});

export const adminChecklistReportResponseSchema = z.object({
  message: z.string(),
  doc: z.record(z.string(), z.any()).optional(),
});

// Type exports
export type GetUpliftDailyStatsRequest = z.infer<
  typeof getUpliftDailyStatsRequestSchema
>;
export type GetUpliftOverallStatsRequest = z.infer<
  typeof getUpliftOverallStatsRequestSchema
>;
export type AdminChecklistReportRequest = z.infer<
  typeof adminChecklistReportRequestSchema
>;

export type DailyStatsResponse = z.infer<typeof dailyStatsResponseSchema>;
export type OverallStatsResponse = z.infer<typeof overallStatsResponseSchema>;
export type AdminChecklistReportResponse = z.infer<
  typeof adminChecklistReportResponseSchema
>;
