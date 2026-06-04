import { request } from "@/lib/api-client";
import type { Vehicle, VehicleFare, Place, BookingRequest, BookingResponse, ServiceTab } from "@/types/booking.types";

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
  return "sedan";
}

// Derived from category since these are booking-form concerns, not stored in DB
const SERVICES_BY_CATEGORY: Record<string, ServiceTab[]> = {
  Hatchback:  ["local"],
  Sedan:      ["local", "outstation", "airport"],
  MUV:        ["local", "outstation", "airport"],
  Luxury:     ["outstation", "airport"],
  Traveller:  ["airport", "outstation"],
};

const ETA_BY_CATEGORY: Record<string, string> = {
  Hatchback:  "3 min",
  Sedan:      "2 min",
  MUV:        "5 min",
  Luxury:     "8 min",
  Traveller:  "10 min",
};

type VehicleApiRow = Omit<Vehicle, "services" | "eta">;

export async function getVehicles(): Promise<Vehicle[]> {
  const res = await request<{ success: boolean; data: VehicleApiRow[] }>("/api/vehicles");
  return (res.data ?? []).map((v) => ({
    ...v,
    services: SERVICES_BY_CATEGORY[v.category] ?? ["local"],
    eta:      ETA_BY_CATEGORY[v.category]      ?? "5 min",
  }));
}

export async function getRecentPlaces(): Promise<Place[]> {
  return [];
}

export async function createBooking(req: BookingRequest): Promise<BookingResponse> {
  const payload = {
    customerName:  req.customerName,
    customerPhone: req.customerPhone,
    source:        "self",
    serviceType:   req.serviceTab,   // local | outstation | airport
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
    tripType:      req.tripTab,
    returnDate:    req.returnDate,
    returnTime:    req.returnTime,
    members:       req.seats,
    vehicleType:   toBackendVehicleType(req.vehicleType),
    ac:            req.ac,
    totalFare:     req.totalFare,
  };

  const res = await request<{
    success: boolean;
    data: { id: string; bookingRef: string };
    returnBooking?: { id: string };
  }>(
    "/api/bookings/create",
    { method: "POST", body: JSON.stringify(payload) },
  );

  return {
    id: res.data.bookingRef,
    bookingId: res.data.id,
    returnBookingId: res.returnBooking?.id,
    status: "confirmed" as const,
  };
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await request<{ success: boolean }>(
    `/api/bookings/${bookingId}/cancel`,
    { method: "PATCH" },
  );
}
