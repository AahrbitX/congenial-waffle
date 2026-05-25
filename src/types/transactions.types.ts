export type PaymentStatus = "created" | "paid" | "cash_pending" | "cash_collected" | "refunded" | "failed";

export interface UserTransaction {
  id: string;
  bookingId: string;
  rzpOrderId: string;
  rzpPaymentId: string | null;
  amount: string;          // numeric string from DB e.g. "500.00"
  currency: string;
  status: PaymentStatus;
  mode: string;            // "full" | "partial"
  paymentMethod: string;   // "online" | "cash"
  paidAt: string | null;
  cashVerifiedAt: string | null;
  adminVerifiedBy: string | null;
  adminVerifiedAt: string | null;
  createdAt: string;
  bookingRef: string;
  journeyDate: string;     // "YYYY-MM-DD"
  journeyTime: string;
  totalFare: string;
  bookingStatus: string;
  driverId: string | null;
  pickupName: string;
  dropName: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: UserTransaction[];
}
