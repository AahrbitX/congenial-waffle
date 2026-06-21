import { MOCK_SERVICES, getServiceBySlug as findBySlug } from "@/data/services.mock";
import type { Service } from "@/types/service.types";

export async function getServices(): Promise<Service[]> {
  return MOCK_SERVICES;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return findBySlug(slug);
}
