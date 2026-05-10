import { useQuery } from "@tanstack/react-query";
import { getRides, getRideById } from "@/api/rides.api";

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
