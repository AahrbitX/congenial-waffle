export type RideStatus = "completed" | "cancelled" | "ongoing" | "pending" | "confirmed";
export type RideFilter = "all" | "completed" | "cancelled";

export interface Ride {
  id: string;
  bookingRef: string;
  status: RideStatus;
  date: string;
  journeyDate: string;
  journeyTime: string;
  vehicleType: string;
  from: string;
  to: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  plate: string;
  fare: number;
  distance: string;
  duration: string;
  rating: number;
  // payment status (e.g. "paid", "cash_pending", "created")
  payment: string;
  tip: number;
  // Payment summary (available on both list + detail view)
  paymentMethod: string;
  paymentMode: string;   // "full" | "partial" | ""
  paidAt: string | null;
  paymentId: string | null;
  paidAmount: number;    // amount already paid (advance or full)
  // Ride-start OTP — only present for confirmed rides (returned from detail view)
  rideStartOtp?: string | null;
  // Timeline timestamps (populated on detail view)
  timelineAt?: {
    pending:   string | null;
    confirmed: string | null;
    ongoing:   string | null;
    completed: string | null;
  };
  // All payment attempts (populated on detail view)
  transactions?: Array<{
    id: string;
    amount: string;
    status: string;
    method: string;
    mode: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

export const STATUS_COLOR: Record<RideStatus, "success" | "danger" | "accent"> = {
  completed: "success",
  cancelled:  "danger",
  ongoing:    "accent",
  pending:    "accent",
  confirmed:  "accent",
};
