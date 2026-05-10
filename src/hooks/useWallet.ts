import { useQuery } from "@tanstack/react-query";
import { getWalletBalance, getTransactions, getPaymentMethods } from "@/api/wallet.api";

export const WALLET_KEY        = ["wallet"] as const;
export const TRANSACTIONS_KEY  = ["transactions"] as const;
export const PAYMENT_METHODS_KEY = ["paymentMethods"] as const;

export function useWalletBalance() {
  return useQuery({ queryKey: WALLET_KEY, queryFn: getWalletBalance });
}

export function useTransactions() {
  return useQuery({ queryKey: TRANSACTIONS_KEY, queryFn: getTransactions });
}

export function usePaymentMethods() {
  return useQuery({ queryKey: PAYMENT_METHODS_KEY, queryFn: getPaymentMethods });
}
