export interface TableData {
  tableNumber: number;
  endDate: string | null;
  isActive: boolean;
}

export interface TableState extends TableData {
  remainingTime: number | null;
} 