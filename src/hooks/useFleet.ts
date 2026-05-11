import { useQuery } from "@tanstack/react-query";
import { getFleet, getFleetCarById } from "@/api/fleet.api";

export const FLEET_KEY = ["fleet"] as const;

export function useFleet() {
  return useQuery({ queryKey: FLEET_KEY, queryFn: getFleet });
}

export function useFleetCar(id: string) {
  return useQuery({
    queryKey: [...FLEET_KEY, id],
    queryFn: () => getFleetCarById(id),
    enabled: !!id,
  });
}
