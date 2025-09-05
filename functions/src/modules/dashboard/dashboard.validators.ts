import { z } from 'zod';

// Input schema for dashboard summary request
export const GetDashboardSummaryInput = z.object({
  uid: z.string().min(1, 'User ID is required'),
  forceMock: z.boolean().optional().default(false),
});

export type GetDashboardSummaryInput = z.infer<typeof GetDashboardSummaryInput>;
