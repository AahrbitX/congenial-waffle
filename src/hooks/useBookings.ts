"use client";

import { request } from "@/lib/api-client";
import { Booking } from "@/types/bookings";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/responseTypes";

export function useBookings({
  id,
  page = 1,
}: { id?: string; page?: number } = {}) {
  return useQuery({
    // If id exists, the key is unique to that booking.
    // If not, it's keyed by the page number for the list.
    queryKey: id ? ["bookings", "detail", id] : ["bookings", "list", page],

    queryFn: async () => {
      // 1. If an ID is provided, fetch the specific booking
      if (id) {
        return request<Booking>(`/api/bookings/${id}`);
      }

      // 2. Otherwise, fetch the paginated list
      return request<PaginatedResponse<Booking[]>>(
        `/api/bookings?page=${page}`,
      );
    },
    // Optional: Prevent fetching if we are waiting for an ID that isn't there yet
    enabled: id !== undefined || !id,
  });
}
