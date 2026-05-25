import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyTransactions,
  getTransactionById,
  createBalancePayment,
  notifyDriver,
  markCashPending,
  verifyDriverCode,
  resendDriverCode,
  adminVerifyPayment,
} from "@/api/transactions.api";

export const MY_TRANSACTIONS_KEY = ["my-transactions"] as const;

export function useMyTransactions() {
  return useQuery({
    queryKey: MY_TRANSACTIONS_KEY,
    queryFn: getMyTransactions,
  });
}

export function useMyTransaction(id: string) {
  return useQuery({
    queryKey: [...MY_TRANSACTIONS_KEY, id],
    queryFn: () => getTransactionById(id),
    enabled: !!id,
  });
}

export function useCreateBalancePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => createBalancePayment(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY }),
  });
}

export function useNotifyDriver() {
  return useMutation({
    mutationFn: (paymentId: string) => notifyDriver(paymentId),
  });
}

export function useMarkCashPending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => markCashPending(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY }),
  });
}

export function useVerifyDriverCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, code }: { paymentId: string; code: string }) =>
      verifyDriverCode(paymentId, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY }),
  });
}

export function useResendDriverCode() {
  return useMutation({
    mutationFn: (paymentId: string) => resendDriverCode(paymentId),
  });
}

export function useAdminVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, approved }: { paymentId: string; approved: boolean }) =>
      adminVerifyPayment(paymentId, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY }),
  });
}
