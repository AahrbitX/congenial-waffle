import { MOCK_SERVICES, getServiceBySlug as findBySlug } from "@/data/services.mock";
import type { Service } from "@/types/service.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getServices(): Promise<Service[]> {
  await delay();
  return MOCK_SERVICES;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  await delay(300);
  return findBySlug(slug);
}
