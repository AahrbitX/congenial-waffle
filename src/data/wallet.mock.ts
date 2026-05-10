import type { Transaction, PaymentMethod, WalletBalance } from "@/types/wallet.types";

export const MOCK_WALLET_BALANCE: WalletBalance = {
  amount: 820,
  lastTopUp: "Today, 8:00 AM",
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "credit", label: "Wallet Top-up",        amount: 500, date: "Today"     },
  { id: "t2", type: "debit",  label: "Ride to Railway Stn",  amount: 180, date: "Today"     },
  { id: "t3", type: "debit",  label: "Ride to Pettah",       amount: 240, date: "Yesterday" },
  { id: "t4", type: "credit", label: "Refund – Cancelled",   amount: 0,   date: "2 May"     },
  { id: "t5", type: "debit",  label: "Ride to Airport",      amount: 520, date: "1 May"     },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm1", label: "UPI – Google Pay", sub: "Linked",    primary: true  },
  { id: "pm2", label: "HDFC Debit Card",  sub: "•••• 4321", primary: false },
];
