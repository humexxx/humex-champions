export interface IChecklistItem {
  name: string;
  completed: boolean;
  movedFromYesterday?: boolean;
}

export interface IChecklist<Timestamp = Date> {
  id?: string;
  date: Timestamp;
  items: IChecklistItem[];
  completionPercentage?: number;
}
