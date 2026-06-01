import { MOCK_VEHICLES } from "@/data/booking.mock";
import { MOCK_RECENT_PLACES } from "@/data/places.mock";
import { request } from "@/lib/api-client";
import type { Vehicle, VehicleFare, Place, BookingRequest, BookingResponse } from "@/types/booking.types";

/** Map frontend display vehicle type names → backend DB enum */
export function toBackendVehicleType(type: string): "hatchback" | "sedan" | "suv" | "minivan" {
  const t = type.toLowerCase();
  if (t.includes("tempo") || t.includes("traveller") || t.includes("mini bus") || t.includes("minibus")) return "minivan";
  if (
    t.includes("innova") || t.includes("crysta") ||
    t.includes("muv")   || t.includes("ertiga")  ||
    t.includes("suv")
  ) return "suv";
  if (t.includes("hatchback")) return "hatchback";
  return "sedan"; // sedan, luxury sedan, luxury suv
}

type DbPricingRow = {
  vehicleType:   string;
  defaultAmount: string;
  defaultUnit:   string;
  serviceFares:  Record<string, { amount: number; unit: string }>;
};

export async function getVehicles(): Promise<Vehicle[]> {
  // Fetch live pricing from DB; fall back to mock defaults if DB unavailable / empty
  let dbPricing: DbPricingRow[] = [];
  try {
    const res = await request<{ success: boolean; data: DbPricingRow[] }>("/api/pricing");
    dbPricing = res.data ?? [];
  } catch {
    return MOCK_VEHICLES;
  }

  if (dbPricing.length === 0) return MOCK_VEHICLES;

  const dbMap = Object.fromEntries(dbPricing.map((p) => [p.vehicleType, p]));

  return MOCK_VEHICLES.map((v) => {
    const db = dbMap[v.type];
    if (!db) return v; // vehicle type not yet configured in DB → use mock
    return {
      ...v,
      defaultFare: {
        amount: parseFloat(db.defaultAmount) || v.defaultFare.amount,
        unit:   db.defaultUnit               || v.defaultFare.unit,
      } satisfies VehicleFare,
      // Only override serviceFares if the DB row has any configured
      serviceFares: Object.keys(db.serviceFares).length > 0
        ? Object.fromEntries(
            Object.entries(db.serviceFares).map(([key, fare]) => [
              key,
              { amount: fare.amount, unit: fare.unit } satisfies VehicleFare,
            ]),
          )
        : v.serviceFares,
    };
  });
}

export async function getRecentPlaces(): Promise<Place[]> {
  return MOCK_RECENT_PLACES;
}

export async function createBooking(req: BookingRequest): Promise<BookingResponse> {
  const payload = {
    customerName:  req.customerName,
    customerPhone: req.customerPhone,
    source:        "self",
    pickupName:    req.pickup,
    pickupZone:    "",
    pickupLat:     req.pickupLat,
    pickupLng:     req.pickupLng,
    dropName:      req.dropoff,
    dropZone:      "",
    dropLat:       req.dropLat,
    dropLng:       req.dropLng,
    journeyDate:   req.date,
    journeyTime:   req.time,
    members:       req.seats,
    vehicleType:   toBackendVehicleType(req.vehicleType),
    ac:            req.ac,
    totalFare:     req.totalFare,
  };

  const res = await request<{ success: boolean; data: { id: string; bookingRef: string } }>(
    "/api/bookings/create",
    { method: "POST", body: JSON.stringify(payload) },
  );

  return { id: res.data.bookingRef, bookingId: res.data.id, status: "confirmed" };
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await request<{ success: boolean }>(
    `/api/bookings/${bookingId}/cancel`,
    { method: "PATCH" },
  );
}
