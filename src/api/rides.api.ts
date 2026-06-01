import { request } from "@/lib/api-client";
import type { Ride, RideStatus } from "@/types/ride.types";

type BookingListItem = {
  id: string;
  bookingRef: string;
  rider: string;
  bookingDate: string;
  driver: string | null;
  driverPhone: string | null;
  source: string;
  driverId: string | null;
  status: string;
  fare: string;
  pickupName: string | null;
  dropName: string | null;
  journeyDate: string | null;
  journeyTime: string | null;
  vehicleType: string | null;
  rating: number | null;
  payMode: string | null;
  payStatus: string | null;
  payAmount: string | null;
  payId: string | null;
};

type BookingsResponse = {
  success: boolean;
  data: BookingListItem[];
  pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
};

function mapStatus(status: string): RideStatus {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  if (status === "confirmed") return "confirmed";
  if (status === "ongoing") return "ongoing";
  return "ongoing";
}

export async function getRides(): Promise<Ride[]> {
  const res = await request<BookingsResponse>("/api/bookings?pageSize=50");
  return res.data.map((b) => ({
    id: b.id,
    bookingRef: b.bookingRef,
    status: mapStatus(b.status),
    date: b.bookingDate,
    journeyDate: b.journeyDate ?? "",
    journeyTime: b.journeyTime ?? "",
    vehicleType: b.vehicleType ?? "",
    from: b.pickupName ?? "—",
    to: b.dropName ?? "—",
    driver: b.driver ?? "",
    driverPhone: b.driverPhone ?? "",
    vehicle: "",
    plate: "",
    fare: parseFloat(b.fare ?? "0"),
    distance: "",
    duration: "",
    rating: b.rating ?? 0,
    payment: b.payStatus ?? "",
    tip: 0,
    paymentMethod: "",
    paymentMode: b.payMode ?? "",
    paidAt: null,
    paymentId: b.payId ?? null,
    paidAmount: parseFloat(b.payAmount ?? "0"),
  }));
}

export async function endTrip(bookingId: string): Promise<void> {
  await request(`/api/bookings/${bookingId}/complete`, { method: "PATCH" });
}

export interface SubmitReviewPayload {
  bookingId:         string;
  rating:            number;
  comment?:          string;
  ratingPunctuality?: number;
  ratingCleanliness?: number;
  ratingBehavior?:    number;
  ratingDriving?:     number;
}

export async function submitReview(payload: SubmitReviewPayload): Promise<void> {
  await request("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRideById(id: string): Promise<Ride> {
  const res = await request<{ success: boolean; data: any }>(`/api/bookings/${id}`);
  const b = res.data;
  return {
    id: b.id,
    bookingRef: b.bookingRef,
    status: mapStatus(b.status),
    date: b.timestamps?.createdAt ?? "",
    from: b.route?.pickupName ?? "—",
    to: b.route?.dropName ?? "—",
    driver: b.driver?.name ?? "",
    driverPhone: b.driver?.phone ?? "",
    vehicle: b.driver?.vehicleType ?? "",
    plate: b.driver?.vehicleNumber ?? "",
    fare: parseFloat(b.payment?.fare ?? "0"),
    distance: "",
    duration: "",
    rating: b.review?.rating ?? 0,
    journeyDate: b.trip?.journeyDate ?? "",
    journeyTime: b.trip?.journeyTime ?? "",
    vehicleType: b.trip?.vehicleType ?? "",
    payment: b.payment?.status ?? "",
    tip: 0,
    paymentMethod: b.payment?.method ?? "",
    paymentMode: b.payment?.mode ?? "",
    paidAt: b.payment?.paidAt ?? null,
    paymentId: b.payment?.id ?? null,
    paidAmount: parseFloat(b.payment?.amount ?? "0"),
    timelineAt: {
      pending:   b.timeline?.pending   ?? null,
      confirmed: b.timeline?.confirmed ?? null,
      ongoing:   b.timeline?.ongoing   ?? null,
      completed: b.timeline?.completed ?? null,
    },
    transactions: (b.transactions ?? []).map((t: any) => ({
      id:        t.id,
      amount:    t.amount ?? "0",
      status:    t.status ?? "",
      method:    t.method ?? "",
      mode:      t.mode ?? "",
      paidAt:    t.paidAt ?? null,
      createdAt: t.createdAt ?? "",
    })),
  };
}

export async function raiseTicket(payload: {
  bookingId?: string;
  category: string;
  subject: string;
  description: string;
}): Promise<void> {
  await request("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
