import { ELabelColorType } from '@shared/enums/ELabelColorType';

export interface ITodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: ETodoPriority;
  labels: ILabel[];
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  pathwayId?: string; // Link to pathway goals
  category: ETodoCategory;
  recurring?: IRecurringConfig;
}

export interface ITodoList<Timestamp = Date> {
  id?: string;
  date: Timestamp;
  items: ITodoItem[];
  completionPercentage: number;
  totalItems: number;
  completedItems: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IRecurringConfig {
  type: ERecurringType;
  interval: number; // e.g., every 2 days, every 1 week
  daysOfWeek?: number[]; // 0-6, for weekly recurring
  endDate?: Date;
  nextDueDate: Date;
}

export interface ILabel {
  id: string;
  title: string;
  color: ELabelColorType;
  category?: ETodoCategory;
}

export enum ETodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ETodoCategory {
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MEDITATION = 'meditation',
  LEARNING = 'learning',
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  SOCIAL = 'social',
  CREATIVE = 'creative',
  OTHER = 'other',
}

export enum ERecurringType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

// Statistics interfaces
export interface ITodoStats {
  daily: IDailyStats;
  weekly: IWeeklyStats;
  monthly: IMonthlyStats;
  streaks: IStreakStats;
  habits: IHabitStats;
}

export interface IDailyStats {
  date: Date;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  categoryBreakdown: Record<ETodoCategory, number>;
  priorityBreakdown: Record<ETodoPriority, number>;
}

export interface IWeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  dailyProgress: IDailyStats[];
  bestDay: {
    date: Date;
    completionRate: number;
  };
  improvementAreas: ETodoCategory[];
}

export interface IMonthlyStats {
  month: number;
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  weeklyProgress: IWeeklyStats[];
  categoryTrends: Record<ETodoCategory, number[]>;
  monthlyGoalAchievement: number;
}

export interface IStreakStats {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: Date;
  streakEndDate?: Date;
  category: ETodoCategory;
  streakHistory: IStreakRecord[];
}

export interface IStreakRecord {
  startDate: Date;
  endDate: Date;
  length: number;
  category: ETodoCategory;
}

export interface IHabitStats {
  habitId: string;
  habitName: string;
  category: ETodoCategory;
  frequency: ERecurringType;
  currentStreak: number;
  completionRate: number;
  lastCompleted?: Date;
  totalCompletions: number;
  createdAt: Date;
}
