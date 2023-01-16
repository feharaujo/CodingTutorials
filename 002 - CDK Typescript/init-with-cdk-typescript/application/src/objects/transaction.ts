export interface Transaction {
  email: string;
  value: number;
  currency: string;
  address?: string;
  phone?: string;
  comments?: string;
}

export interface RecordedTransaction extends Transaction {
  createdAt: string;
}
