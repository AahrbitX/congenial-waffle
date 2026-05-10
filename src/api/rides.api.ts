import { MOCK_RIDES } from "@/data/rides.mock";
import type { Ride } from "@/types/ride.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getRides(): Promise<Ride[]> {
  await delay();
  return MOCK_RIDES;
}

export async function getRideById(id: string): Promise<Ride | undefined> {
  await delay(300);
  return MOCK_RIDES.find((r) => r.id === id);
}
