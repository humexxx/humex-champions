export enum EInstrumentType {
  SYSTEM = 'SYSTEM',
}

export interface IInstrument {
  id?: string;
  name: string;
  value: number;
}
