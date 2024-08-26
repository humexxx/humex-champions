import { Timestamp } from '@firebase/firestore-types';

export interface IChecklistItem {
  name: string;
  completed: boolean;
}

export interface IChecklist {
  date: Timestamp;
  items: ChecklistItem[];
}
