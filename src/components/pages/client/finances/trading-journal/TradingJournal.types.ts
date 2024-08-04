export interface Trade {
  id?: string;
  pl: number;
  instrument: string;
}

export interface SummaryPanelProps {
  trades: number;
  percentage: number;
  amount: number;
  monthlyGrowth: number;
}
