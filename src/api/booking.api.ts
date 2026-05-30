import { MOCK_VEHICLES } from "@/data/booking.mock";
import { MOCK_RECENT_PLACES } from "@/data/places.mock";
import { request } from "@/lib/api-client";
import type { Vehicle, Place, BookingRequest, BookingResponse } from "@/types/booking.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

/** Map frontend display vehicle types → backend DB enum */
function toBackendVehicleType(type: string): "hatchback" | "sedan" | "suv" | "minivan" {
  const t = type.toLowerCase();
  if (t.includes("tempo") || t.includes("traveller")) return "minivan";
  if (
    t.includes("innova") || t.includes("crysta") ||
    t.includes("muv")   || t.includes("ertiga")  ||
    t.includes("suv")
  ) return "suv";
  if (t.includes("hatchback")) return "hatchback";
  return "sedan"; // sedan, luxury sedan
}

export async function getVehicles(): Promise<Vehicle[]> {
  await delay();
  return MOCK_VEHICLES;
}

export async function getRecentPlaces(): Promise<Place[]> {
  await delay(300);
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

