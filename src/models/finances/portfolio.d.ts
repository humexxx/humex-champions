import { Timestamp } from 'firebase/firestore';
import { IInstrument } from '../instruments';

export interface IPortfolioSnapshot {
  id?: string;
  date: Timestamp;
  totalValue: number;
  totalProfit?: number;
  totalProfitPercentage?: number;
  instruments: IUserInstrument[];
}

export interface IUserInstrument extends IInstrument {
  positionPercentage: number;
}
