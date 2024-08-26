import * as admin from 'firebase-admin';

export interface IChecklistItem {
  name: string;
  completed: boolean;
  movedFromYesterday?: boolean;
}

export interface IChecklist {
  id?: string;
  date: admin.firestore.Timestamp;
  items: IChecklistItem[];
  completionPercentage?: number;
}
