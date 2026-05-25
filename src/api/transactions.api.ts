import { request } from "@/lib/api-client";
import type { UserTransaction, TransactionsResponse } from "@/types/transactions.types";

export async function getMyTransactions(): Promise<UserTransaction[]> {
  const res = await request<TransactionsResponse>("/api/payments/my-transactions");
  return res.data;
}

export async function getTransactionById(id: string): Promise<UserTransaction | undefined> {
  const all = await getMyTransactions();
  return all.find((t) => t.id === id);
}

export async function createBalancePayment(paymentId: string): Promise<{ paymentId: string }> {
  const res = await request<{ success: boolean; data: { paymentId: string } }>(
    `/api/payments/${paymentId}/create-balance`,
    { method: "POST" },
  );
  return res.data;
}

export async function markCashPending(paymentId: string): Promise<void> {
  await request<{ success: boolean }>(`/api/payments/${paymentId}/mark-cash`, {
    method: "POST",
  });
}

export async function verifyDriverCode(paymentId: string, code: string): Promise<void> {
  await request<{ success: boolean }>(`/api/payments/${paymentId}/verify-code`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function notifyDriver(paymentId: string): Promise<{ driverAssigned: boolean }> {
  const res = await request<{ success: boolean; driverAssigned: boolean }>(
    `/api/payments/${paymentId}/notify-driver`,
    { method: "POST" },
  );
  return { driverAssigned: res.driverAssigned };
}

export async function resendDriverCode(paymentId: string): Promise<void> {
  await request<{ success: boolean }>(`/api/payments/${paymentId}/resend-code`, {
    method: "POST",
  });
}

export async function adminVerifyPayment(paymentId: string, approved: boolean): Promise<void> {
  await request<{ success: boolean }>(`/api/payments/${paymentId}/admin-verify`, {
    method: "PATCH",
    body: JSON.stringify({ approved }),
  });
}
