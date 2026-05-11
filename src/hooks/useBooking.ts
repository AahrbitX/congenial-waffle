import { useQuery, useMutation } from "@tanstack/react-query";
import { getVehicles, getRecentPlaces, createBooking } from "@/api/booking.api";
import type { BookingRequest } from "@/types/booking.types";

export const VEHICLES_KEY      = ["vehicles"] as const;
export const RECENT_PLACES_KEY = ["recentPlaces"] as const;

export function useVehicles() {
  return useQuery({ queryKey: VEHICLES_KEY, queryFn: getVehicles });
}

export function useRecentPlaces() {
  return useQuery({ queryKey: RECENT_PLACES_KEY, queryFn: getRecentPlaces });
}

export function useCreateBooking(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (req: BookingRequest) => createBooking(req),
    onSuccess,
  });
}
