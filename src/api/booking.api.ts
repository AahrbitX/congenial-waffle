import { MOCK_VEHICLES } from "@/data/booking.mock";
import { MOCK_RECENT_PLACES } from "@/data/places.mock";
import type { Vehicle, Place, BookingRequest, BookingResponse } from "@/types/booking.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getVehicles(): Promise<Vehicle[]> {
  await delay();
  return MOCK_VEHICLES;
}

export async function getRecentPlaces(): Promise<Place[]> {
  await delay(300);
  return MOCK_RECENT_PLACES;
}

export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  await delay(800);
  return { id: `TRP-${Date.now()}`, status: "confirmed" };
}
