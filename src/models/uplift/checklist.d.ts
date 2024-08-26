import { Timestamp } from '@firebase/firestore-types';

export interface IChecklistItem {
  name: string;
  completed: boolean;
}

export interface IChecklist {
  id?: string;
  date: Timestamp;
  items: ChecklistItem[];
}
