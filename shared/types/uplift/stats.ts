export interface IUpliftStats {
  userId: string;
  date: Date;
  todos: ITodoStats;
  pathways: IPathwayStats;
  overall: IOverallStats;
  generatedAt: Date;
}

export interface IPathwayStats {
  activePathways: number;
  completedPathways: number;
  totalGoalsCompleted: number;
  averagePathwayProgress: number;
  categoryProgress: Record<EPathwayCategory, number>;
  streaks: {
    longest: number;
    current: number;
    category: EPathwayCategory;
  };
}

export interface IOverallStats {
  productivityScore: number; // 0-100 based on completion rates
  consistencyScore: number; // 0-100 based on streaks and regularity
  growthScore: number; // 0-100 based on pathway progress
  focusAreas: EPathwayCategory[]; // Top 3 most active categories
  achievements: IAchievement[];
  recommendations: IRecommendation[];
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: EPathwayCategory;
  unlockedAt: Date;
  rarity: EAchievementRarity;
}

export interface IRecommendation {
  id: string;
  type: ERecommendationType;
  title: string;
  description: string;
  actionUrl?: string;
  priority: number; // 1-5
  category: EPathwayCategory;
}

export enum EAchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum ERecommendationType {
  NEW_PATHWAY = 'new_pathway',
  INCREASE_FREQUENCY = 'increase_frequency',
  FOCUS_AREA = 'focus_area',
  BALANCE_SUGGESTION = 'balance_suggestion',
  STREAK_RECOVERY = 'streak_recovery',
}

// Import types from other uplift models
import { ITodoStats } from './todo';
import { EPathwayCategory } from './pathway';
