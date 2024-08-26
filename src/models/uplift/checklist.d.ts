import { Timestamp } from '@firebase/firestore-types';

export interface IChecklistItem {
  name: string;
  completed: boolean;
  movedFromYesterday?: boolean;
}

export interface IChecklist {
  id?: string;
  date: Timestamp;
  items: IChecklistItem[];
  completionPercentage?: number;
}
