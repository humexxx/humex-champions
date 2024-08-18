import { Dayjs } from 'dayjs';

export interface ITrade {
  pl: number;
  instrument: string;
}

export interface IOperation {
  date: Dayjs;
  notes: string;
  trades: Trade[];
}

export interface ITradingJournal {
  id?: string;
  date: Dayjs;
  operations: Operation[];
}
