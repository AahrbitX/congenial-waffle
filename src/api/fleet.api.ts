import { request } from "@/lib/api-client";
import type { FleetVehicle } from "@/types/fleet.types";

type FleetListResponse = { success: boolean; data: FleetVehicle[] };
type FleetSingleResponse = { success: boolean; data: FleetVehicle };

export async function getFleet(): Promise<FleetVehicle[]> {
  const res = await request<FleetListResponse>("/api/fleet");
  return res.data;
}

export type CreateFleetBody = Pick<
  FleetVehicle,
  | "name"
  | "tagline"
  | "category"
  | "image"
  | "seats"
  | "bags"
  | "ac"
  | "fuel"
  | "features"
  | "priceFrom"
  | "sortOrder"
>;

export async function createFleetVehicle(
  body: CreateFleetBody,
): Promise<FleetVehicle> {
  const res = await request<FleetSingleResponse>("/api/fleet", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateFleetVehicle(
  id: string,
  body: Partial<CreateFleetBody & { active: boolean }>,
): Promise<FleetVehicle> {
  const res = await request<FleetSingleResponse>(`/api/fleet/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteFleetVehicle(id: string): Promise<void> {
  await request<{ success: boolean }>(`/api/fleet/${id}`, { method: "DELETE" });
}
