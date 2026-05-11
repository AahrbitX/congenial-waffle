import type { Vehicle, ServiceTab } from "@/types/booking.types";

export const MOCK_VEHICLES: Vehicle[] = [
  // ── Hatchback ─────────────────────────────────────────────────
  {
    type: "Hatchback", category: "Hatchback",
    seats: 4, fare: 9, fareUnit: "per km",
    eta: "3 min", desc: "Economy · Compact", ac: true,
    services: ["local"],
  },
  {
    type: "Hatchback (Non-AC)", category: "Hatchback",
    seats: 4, fare: 7, fareUnit: "per km",
    eta: "3 min", desc: "Economy · Compact", ac: false,
    services: ["local"],
  },
  // ── Sedan ─────────────────────────────────────────────────────
  {
    type: "Sedan", category: "Sedan",
    seats: 4, fare: 12, fareUnit: "per km",
    eta: "2 min", desc: "Comfort · Reliable", ac: true,
    services: ["local", "outstation", "airport"],
  },
  {
    type: "Sedan (Non-AC)", category: "Sedan",
    seats: 4, fare: 10, fareUnit: "per km",
    eta: "2 min", desc: "Comfort · Reliable", ac: false,
    services: ["local", "outstation", "airport"],
  },
  // ── MUV ───────────────────────────────────────────────────────
  {
    type: "MUV / Ertiga", category: "MUV",
    seats: 6, fare: 16, fareUnit: "per km",
    eta: "5 min", desc: "Family · 6 Seater", ac: true,
    services: ["local", "outstation", "airport"],
  },
  {
    type: "Innova / Crysta", category: "MUV",
    seats: 7, fare: 18, fareUnit: "per km",
    eta: "6 min", desc: "Premium MUV · 7 Seater", ac: true,
    services: ["local", "outstation", "airport"],
  },
  {
    type: "Innova (Non-AC)", category: "MUV",
    seats: 7, fare: 15, fareUnit: "per km",
    eta: "6 min", desc: "MUV · 7 Seater", ac: false,
    services: ["local", "outstation"],
  },
  // ── Luxury ────────────────────────────────────────────────────
  {
    type: "Luxury Sedan", category: "Luxury",
    seats: 4, fare: 24, fareUnit: "per km",
    eta: "8 min", desc: "Executive · Chauffeur", ac: true,
    services: ["outstation", "airport"],
  },
  // ── Tempo Traveller ───────────────────────────────────────────
  {
    type: "Tempo Traveller", category: "Traveller",
    seats: 12, fare: 25, fareUnit: "per km",
    eta: "10 min", desc: "Group · 12 Seater", ac: true,
    services: ["airport", "outstation"],
  },
  {
    type: "Tempo Traveller (Non-AC)", category: "Traveller",
    seats: 12, fare: 20, fareUnit: "per km",
    eta: "10 min", desc: "Group · 12 Seater", ac: false,
    services: ["airport", "outstation"],
  },
];

export const PAYMENT_OPTIONS = ["UPI", "Cash", "Card", "Wallet"] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];

export function filterVehicles(
  vehicles: Vehicle[],
  serviceTab: ServiceTab,
  ac: boolean | null,  // null = any
  minSeats: number     // 0 = any
): Vehicle[] {
  return vehicles.filter(
    (v) =>
      v.services.includes(serviceTab) &&
      (ac === null || v.ac === ac) &&
      (minSeats === 0 || v.seats >= minSeats)
  );
}
