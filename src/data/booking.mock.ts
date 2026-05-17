import type { Vehicle, VehicleFare, ServiceTab } from "@/types/booking.types";

// ── Helper ────────────────────────────────────────────────────────────────────

export function getVehicleFare(vehicle: Vehicle, serviceId?: string): VehicleFare {
  if (serviceId && vehicle.serviceFares[serviceId]) {
    return vehicle.serviceFares[serviceId];
  }
  return vehicle.defaultFare;
}

export function formatFare(fare: VehicleFare): string {
  const amount = `₹${fare.amount.toLocaleString("en-IN")}`;
  switch (fare.unit) {
    case "flat":      return `${amount} flat`;
    case "per km":    return `${amount}/km`;
    case "per 8 hrs": return `${amount}/8 hrs`;
    case "per day":   return `${amount}/day`;
    case "per week":  return `${amount}/week`;
    default:          return `${amount} ${fare.unit}`;
  }
}

// ── Vehicle catalogue ─────────────────────────────────────────────────────────

export const MOCK_VEHICLES: Vehicle[] = [
  // ── Hatchback (AC) ────────────────────────────────────────────────────────
  {
    type: "Hatchback", category: "Hatchback",
    seats: 4, ac: true, eta: "3 min", desc: "Economy · Compact",
    services: ["local"],
    defaultFare: { amount: 9, unit: "per km" },
    serviceFares: {
      "city-taxi":      { amount: 9,     unit: "per km"   },
      "airport":        { amount: 399,   unit: "flat"     },
      "railway":        { amount: 199,   unit: "flat"     },
      "full-day-hire":  { amount: 999,   unit: "per 8 hrs"},
      "weekly-commute": { amount: 2999,  unit: "per week" },
      "rent-a-car":     { amount: 600,   unit: "per day"  },
    },
  },
  // ── Hatchback (Non-AC) ────────────────────────────────────────────────────
  {
    type: "Hatchback (Non-AC)", category: "Hatchback",
    seats: 4, ac: false, eta: "3 min", desc: "Economy · Compact",
    services: ["local"],
    defaultFare: { amount: 7, unit: "per km" },
    serviceFares: {
      "city-taxi":      { amount: 7,    unit: "per km"   },
      "airport":        { amount: 299,  unit: "flat"     },
      "railway":        { amount: 149,  unit: "flat"     },
      "full-day-hire":  { amount: 799,  unit: "per 8 hrs"},
      "weekly-commute": { amount: 2499, unit: "per week" },
    },
  },
  // ── Sedan (AC) ────────────────────────────────────────────────────────────
  {
    type: "Sedan", category: "Sedan",
    seats: 4, ac: true, eta: "2 min", desc: "Comfort · Reliable",
    services: ["local", "outstation", "airport"],
    defaultFare: { amount: 12, unit: "per km" },
    serviceFares: {
      "city-taxi":            { amount: 12,   unit: "per km"   },
      "outstation":           { amount: 12,   unit: "per km"   },
      "outstation-oneway":    { amount: 12,   unit: "per km"   },
      "outstation-roundtrip": { amount: 12,   unit: "per km"   },
      "nationwide":           { amount: 12,   unit: "per km"   },
      "airport":              { amount: 599,  unit: "flat"     },
      "railway":              { amount: 299,  unit: "flat"     },
      "full-day-hire":        { amount: 1299, unit: "per 8 hrs"},
      "weekly-commute":       { amount: 3999, unit: "per week" },
      "rent-a-car":           { amount: 800,  unit: "per day"  },
      "wedding":              { amount: 5000, unit: "per day"  },
      "tours":                { amount: 3500, unit: "per day"  },
      "events":               { amount: 4000, unit: "per day"  },
    },
  },
  // ── Sedan (Non-AC) ────────────────────────────────────────────────────────
  {
    type: "Sedan (Non-AC)", category: "Sedan",
    seats: 4, ac: false, eta: "2 min", desc: "Comfort · Reliable",
    services: ["local", "outstation", "airport"],
    defaultFare: { amount: 10, unit: "per km" },
    serviceFares: {
      "city-taxi":            { amount: 10,   unit: "per km"   },
      "outstation":           { amount: 10,   unit: "per km"   },
      "outstation-oneway":    { amount: 10,   unit: "per km"   },
      "outstation-roundtrip": { amount: 10,   unit: "per km"   },
      "nationwide":           { amount: 10,   unit: "per km"   },
      "airport":              { amount: 499,  unit: "flat"     },
      "railway":              { amount: 249,  unit: "flat"     },
      "full-day-hire":        { amount: 1099, unit: "per 8 hrs"},
      "weekly-commute":       { amount: 3499, unit: "per week" },
    },
  },
  // ── MUV / Ertiga (AC) ────────────────────────────────────────────────────
  {
    type: "MUV / Ertiga", category: "MUV",
    seats: 6, ac: true, eta: "5 min", desc: "Family · 6 Seater",
    services: ["local", "outstation", "airport"],
    defaultFare: { amount: 16, unit: "per km" },
    serviceFares: {
      "city-taxi":            { amount: 16,   unit: "per km"   },
      "outstation":           { amount: 16,   unit: "per km"   },
      "outstation-oneway":    { amount: 16,   unit: "per km"   },
      "outstation-roundtrip": { amount: 16,   unit: "per km"   },
      "nationwide":           { amount: 16,   unit: "per km"   },
      "airport":              { amount: 799,  unit: "flat"     },
      "railway":              { amount: 399,  unit: "flat"     },
      "full-day-hire":        { amount: 1699, unit: "per 8 hrs"},
      "weekly-commute":       { amount: 5499, unit: "per week" },
      "rent-a-car":           { amount: 1200, unit: "per day"  },
      "wedding":              { amount: 7000, unit: "per day"  },
      "tours":                { amount: 5000, unit: "per day"  },
      "events":               { amount: 5500, unit: "per day"  },
    },
  },
  // ── Innova / Crysta (AC) ─────────────────────────────────────────────────
  {
    type: "Innova / Crysta", category: "MUV",
    seats: 7, ac: true, eta: "6 min", desc: "Premium MUV · 7 Seater",
    services: ["local", "outstation", "airport"],
    defaultFare: { amount: 18, unit: "per km" },
    serviceFares: {
      "city-taxi":            { amount: 18,   unit: "per km"   },
      "outstation":           { amount: 18,   unit: "per km"   },
      "outstation-oneway":    { amount: 18,   unit: "per km"   },
      "outstation-roundtrip": { amount: 18,   unit: "per km"   },
      "nationwide":           { amount: 18,   unit: "per km"   },
      "airport":              { amount: 899,  unit: "flat"     },
      "railway":              { amount: 449,  unit: "flat"     },
      "full-day-hire":        { amount: 1999, unit: "per 8 hrs"},
      "weekly-commute":       { amount: 6499, unit: "per week" },
      "rent-a-car":           { amount: 1600, unit: "per day"  },
      "wedding":              { amount: 9000, unit: "per day"  },
      "tours":                { amount: 6000, unit: "per day"  },
      "events":               { amount: 6500, unit: "per day"  },
    },
  },
  // ── Innova (Non-AC) ───────────────────────────────────────────────────────
  {
    type: "Innova (Non-AC)", category: "MUV",
    seats: 7, ac: false, eta: "6 min", desc: "MUV · 7 Seater",
    services: ["local", "outstation"],
    defaultFare: { amount: 15, unit: "per km" },
    serviceFares: {
      "city-taxi":            { amount: 15,   unit: "per km"   },
      "outstation":           { amount: 15,   unit: "per km"   },
      "outstation-oneway":    { amount: 15,   unit: "per km"   },
      "outstation-roundtrip": { amount: 15,   unit: "per km"   },
      "full-day-hire":        { amount: 1699, unit: "per 8 hrs"},
    },
  },
  // ── Luxury Sedan ─────────────────────────────────────────────────────────
  {
    type: "Luxury Sedan", category: "Luxury",
    seats: 4, ac: true, eta: "8 min", desc: "Executive · Chauffeur",
    services: ["outstation", "airport"],
    defaultFare: { amount: 24, unit: "per km" },
    serviceFares: {
      "outstation":           { amount: 24,    unit: "per km"  },
      "outstation-oneway":    { amount: 24,    unit: "per km"  },
      "outstation-roundtrip": { amount: 24,    unit: "per km"  },
      "nationwide":           { amount: 24,    unit: "per km"  },
      "airport":              { amount: 1299,  unit: "flat"    },
      "railway":              { amount: 699,   unit: "flat"    },
      "rent-a-car":           { amount: 2500,  unit: "per day" },
      "wedding":              { amount: 12000, unit: "per day" },
      "tours":                { amount: 9000,  unit: "per day" },
      "events":               { amount: 10000, unit: "per day" },
    },
  },
  // ── Tempo Traveller (AC) ─────────────────────────────────────────────────
  {
    type: "Tempo Traveller", category: "Traveller",
    seats: 12, ac: true, eta: "10 min", desc: "Group · 12 Seater",
    services: ["airport", "outstation"],
    defaultFare: { amount: 25, unit: "per km" },
    serviceFares: {
      "tempo":                { amount: 25,   unit: "per km"  },
      "outstation":           { amount: 25,   unit: "per km"  },
      "outstation-oneway":    { amount: 25,   unit: "per km"  },
      "outstation-roundtrip": { amount: 25,   unit: "per km"  },
      "airport":              { amount: 1599, unit: "flat"    },
      "tours":                { amount: 7000, unit: "per day" },
      "events":               { amount: 8000, unit: "per day" },
    },
  },
  // ── Tempo Traveller (Non-AC) ──────────────────────────────────────────────
  {
    type: "Tempo Traveller (Non-AC)", category: "Traveller",
    seats: 12, ac: false, eta: "10 min", desc: "Group · 12 Seater",
    services: ["airport", "outstation"],
    defaultFare: { amount: 20, unit: "per km" },
    serviceFares: {
      "tempo":                { amount: 20,   unit: "per km"  },
      "outstation":           { amount: 20,   unit: "per km"  },
      "outstation-oneway":    { amount: 20,   unit: "per km"  },
      "outstation-roundtrip": { amount: 20,   unit: "per km"  },
      "airport":              { amount: 1299, unit: "flat"    },
      "tours":                { amount: 5500, unit: "per day" },
      "events":               { amount: 6500, unit: "per day" },
    },
  },
];

export const PAYMENT_OPTIONS = ["UPI", "Cash", "Card", "Wallet"] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];

export function filterVehicles(
  vehicles: Vehicle[],
  serviceTab: ServiceTab,
  ac: boolean | null,
  minSeats: number,
  allowedCategories?: string[],
  serviceId?: string          // when provided, vehicle must have a fare for this service
): Vehicle[] {
  return vehicles.filter((v) => {
    if (allowedCategories && allowedCategories.length > 0) {
      if (!allowedCategories.includes(v.category)) return false;
      // Require an explicit service fare — prevents wrong fallback pricing
      if (serviceId && !v.serviceFares[serviceId]) return false;
    } else {
      if (!v.services.includes(serviceTab)) return false;
    }
    if (ac !== null && v.ac !== ac) return false;
    if (minSeats > 0 && v.seats < minSeats) return false;
    return true;
  });
}
