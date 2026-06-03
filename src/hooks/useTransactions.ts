import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getMyTransactions,
  getTransactionById,
  createBalancePayment,
  notifyDriver,
  markCashPending,
  verifyDriverCode,
  resendDriverCode,
  adminVerifyPayment,
  createPaymentOrder,
  verifyPayment,
} from "@/api/transactions.api";

export const MY_TRANSACTIONS_KEY = ["my-transactions"] as const;

export function useMyTransactions() {
  return useQuery({
    queryKey: MY_TRANSACTIONS_KEY,
    queryFn: getMyTransactions,
  });
}

export function useMyTransaction(id: string, refetchInterval?: number) {
  return useQuery({
    queryKey: [...MY_TRANSACTIONS_KEY, id],
    queryFn: () => getTransactionById(id),
    enabled: !!id,
    refetchInterval,
  });
}

export function useCreateBalancePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => createBalancePayment(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ["rides"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ["rides"] });
    },
  });
}

export function useVerifyDriverCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, code }: { paymentId: string; code: string }) =>
      verifyDriverCode(paymentId, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ["rides"] });
    },
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

/** Opens Razorpay checkout for an existing booking/payment. */
export function useRazorpayPayment() {
  const qc = useQueryClient();

  const pay = useCallback(async ({
    bookingId,
    amount,
    mode,
    userName,
    userPhone,
    onSuccess,
    onError,
  }: {
    bookingId: string;
    amount: number;
    mode: "full" | "partial" | "balance";
    userName?: string;
    userPhone?: string;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
  }) => {
    let orderData: { orderId: string; amount: number; currency: string; keyId: string };
    try {
      const res = await createPaymentOrder(bookingId, amount, mode);
      orderData = res.data;
    } catch {
      onError?.("Failed to initiate payment. Please try again.");
      return;
    }

    const rzp = new (window as any).Razorpay({
      key: orderData.keyId,
      order_id: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Mohan Cabs",
      description: "Ride Payment",
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await verifyPayment(bookingId, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          qc.invalidateQueries({ queryKey: MY_TRANSACTIONS_KEY });
          qc.invalidateQueries({ queryKey: ["rides"] });
          onSuccess?.();
        } catch {
          onError?.("Payment verification failed. Please contact support.");
        }
      },
      prefill: { name: userName ?? "", contact: userPhone ?? "" },
    });
    rzp.open();
  }, [qc]);

  return { pay };
}
