import type { Vehicle } from "@/types/booking.types";

export const MOCK_VEHICLES: Vehicle[] = [
  { type: "Mini",  seats: 4, fare: 120, eta: "3 min", desc: "Economy · AC" },
  { type: "Sedan", seats: 4, fare: 180, eta: "2 min", desc: "Comfort · AC" },
  { type: "MPV",   seats: 7, fare: 260, eta: "5 min", desc: "Family · AC"  },
  { type: "SUV",   seats: 6, fare: 340, eta: "8 min", desc: "Premium · AC" },
];

export const PAYMENT_OPTIONS = ["UPI", "Cash", "Card", "Wallet"] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];
