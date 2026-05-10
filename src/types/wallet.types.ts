export type TransactionType = "credit" | "debit";

export interface Transaction {
  id: string;
  type: TransactionType;
  label: string;
  amount: number;
  date: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  sub: string;
  primary: boolean;
}

export interface WalletBalance {
  amount: number;
  lastTopUp: string;
}
