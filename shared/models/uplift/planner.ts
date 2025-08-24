import { ELabelColorType } from '@shared/enums/ELabelColorType';

export interface IPlannerItem {
  title: string;
  completed: boolean;
  labels: IPlannerLabel[];
}

export interface IPlanner<Timestamp = Date> {
  id?: string;
  date: Timestamp;
  items: IPlannerItem[];
  completionPercentage?: number;
}

export interface IPlannerLabel {
  title: string;
  color: ELabelColorType;
}
