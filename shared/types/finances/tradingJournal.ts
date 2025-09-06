import { Dayjs } from 'dayjs';

export interface ITrade {
  pl: number;
  instrument: string;
}

export interface IOperation {
  date: Dayjs;
  notes: string;
  trades: ITrade[];
  balanceStart: number;
  balanceEnd: number;
  transactions?: ITransaction[];
}

export interface ITransaction {
  amount: number;
  type: 'deposit' | 'withdrawal';
  notes?: string;
}

export interface ITradingJournal {
  id?: string;
  date: Dayjs;
  operations: IOperation[];
}
