import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFleet,
  createFleetVehicle,
  updateFleetVehicle,
  deleteFleetVehicle,
  type CreateFleetBody,
} from "@/api/fleet.api";

export const FLEET_KEY = ["fleet"] as const;

export function useFleet() {
  return useQuery({ queryKey: FLEET_KEY, queryFn: getFleet });
}

export function useCreateFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFleetBody) => createFleetVehicle(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: FLEET_KEY }),
  });
}

export function useUpdateFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateFleetBody & { active: boolean }> }) =>
      updateFleetVehicle(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: FLEET_KEY }),
  });
}

export function useDeleteFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFleetVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: FLEET_KEY }),
  });
}
