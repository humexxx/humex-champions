import { IInstrument } from '../instruments';
import dayjs from 'dayjs';

export interface IPortfolioSnapshot {
  id?: string;
  date: dayjs.Dayjs;
  totalValue: number;
  totalProfit?: number;
  totalProfitPercentage?: number;
  instruments: IUserInstrument[];
}

export interface IUserInstrument extends IInstrument {
  positionPercentage: number;
}
