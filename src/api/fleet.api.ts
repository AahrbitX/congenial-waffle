import { MOCK_FLEET, getFleetCarById as findById } from "@/data/fleet.mock";
import type { FleetCar } from "@/types/fleet.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getFleet(): Promise<FleetCar[]> {
  await delay();
  return MOCK_FLEET;
}

export async function getFleetCarById(id: string): Promise<FleetCar | undefined> {
  await delay(300);
  return findById(id);
}
