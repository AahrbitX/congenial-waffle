import { MOCK_TRANSACTIONS, MOCK_PAYMENT_METHODS, MOCK_WALLET_BALANCE } from "@/data/wallet.mock";
import type { Transaction, PaymentMethod, WalletBalance } from "@/types/wallet.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getWalletBalance(): Promise<WalletBalance> {
  await delay();
  return MOCK_WALLET_BALANCE;
}

export async function getTransactions(): Promise<Transaction[]> {
  await delay();
  return MOCK_TRANSACTIONS;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await delay(300);
  return MOCK_PAYMENT_METHODS;
}

export async function addMoney(amount: number): Promise<WalletBalance> {
  await delay(600);
  return { amount: MOCK_WALLET_BALANCE.amount + amount, lastTopUp: "Just now" };
}
