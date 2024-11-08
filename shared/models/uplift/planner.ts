import { ELabelColorType } from '@shared/enums/ELabelColorType';

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

export interface ILabel {
  title: string;
  color: ELabelColorType;
}
