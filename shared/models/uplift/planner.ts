export interface IPlannerItem {
  title: string;
  completed: boolean;
}

export interface IPlanner<Timestamp = Date> {
  id?: string;
  date: Timestamp;
  items: IPlannerItem[];
  completionPercentage?: number;
}
