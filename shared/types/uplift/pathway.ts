export interface IPathway {
  id: string;
  title: string;
  description: string;
  category: EPathwayCategory;
  color: string;
  icon: string;
  goals: IPathwayGoal[];
  progress: IPathwayProgress;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration: number; // in days
  difficulty: EPathwayDifficulty;
}

export interface IPathwayGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // "minutes", "reps", "pages", etc.
  frequency: EGoalFrequency;
  milestones: IMilestone[];
  isCompleted: boolean;
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  autoGenerateTodos: boolean; // Whether to create daily todos for this goal
  todoTemplate?: ITodoTemplate;
}

export interface IMilestone {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  isCompleted: boolean;
  completedDate?: Date;
  reward?: string;
}

export interface ITodoTemplate {
  title: string;
  description?: string;
  defaultDuration?: number; // in minutes
  priority: ETodoPriority;
  category: ETodoCategory;
  labels: string[]; // label IDs
}

export interface IPathwayProgress {
  overallCompletion: number; // 0-100
  goalsCompleted: number;
  totalGoals: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  weeklyProgress: number[];
  monthlyProgress: number[];
}

export enum EPathwayCategory {
  FITNESS = 'fitness',
  MINDFULNESS = 'mindfulness',
  NUTRITION = 'nutrition',
  LEARNING = 'learning',
  CAREER = 'career',
  RELATIONSHIPS = 'relationships',
  CREATIVITY = 'creativity',
  HEALTH = 'health',
  FINANCIAL = 'financial',
  PERSONAL_GROWTH = 'personal_growth',
}

export enum EPathwayDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum EGoalFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

// Predefined pathway templates
export interface IPathwayTemplate {
  id: string;
  title: string;
  description: string;
  category: EPathwayCategory;
  color: string;
  icon: string;
  difficulty: EPathwayDifficulty;
  estimatedDuration: number;
  goals: Omit<
    IPathwayGoal,
    'id' | 'currentValue' | 'isCompleted' | 'completedDate'
  >[];
}

// Import necessary types for todo integration
import { ETodoPriority, ETodoCategory } from './todo';
