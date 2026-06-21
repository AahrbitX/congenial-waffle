import { request } from "@/lib/api-client";
import type { Service, CreateServiceBody, UpdateServiceBody, AddLocationBody, ServiceLocation } from "@/types/service.types";

type ServicesListResponse = { success: boolean; data: Service[] };
type ServiceResponse      = { success: boolean; data: Service };
type LocationResponse     = { success: boolean; data: ServiceLocation };

export async function getServices(): Promise<Service[]> {
  const res = await request<ServicesListResponse>("/api/services");
  return res.data;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const res = await request<ServiceResponse>(`/api/services/${slug}`);
  return res.data;
}

export async function createService(body: CreateServiceBody): Promise<Service> {
  const res = await request<ServiceResponse>("/api/services", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateService(slug: string, body: UpdateServiceBody): Promise<Service> {
  const res = await request<ServiceResponse>(`/api/services/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteService(slug: string): Promise<void> {
  await request<{ success: boolean }>(`/api/services/${slug}`, { method: "DELETE" });
}

export async function addServiceLocation(slug: string, body: AddLocationBody): Promise<ServiceLocation> {
  const res = await request<LocationResponse>(`/api/services/${slug}/locations`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteServiceLocation(slug: string, locationId: string): Promise<void> {
  await request<{ success: boolean }>(`/api/services/${slug}/locations/${locationId}`, {
    method: "DELETE",
  });
}
