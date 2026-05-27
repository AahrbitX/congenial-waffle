import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRides, getRideById, endTrip, submitReview } from "@/api/rides.api";
import { request } from "@/lib/api-client";

export const RIDES_KEY = ["rides"] as const;

export function useRides() {
  return useQuery({ queryKey: RIDES_KEY, queryFn: getRides });
}

export function useRide(id: string) {
  return useQuery({
    queryKey: [...RIDES_KEY, id],
    queryFn: () => getRideById(id),
    enabled: !!id,
  });
}

export function useCancelRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      request(`/api/bookings/${bookingId}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RIDES_KEY });
    },
  });
}

export function useEndTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => endTrip(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RIDES_KEY });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment?: string }) =>
      submitReview(bookingId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RIDES_KEY });
    },
  });
}
