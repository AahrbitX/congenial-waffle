import { request } from "@/lib/api-client";

export interface VehiclePricing {
  id: string;
  vehicleType: string;
  defaultAmount: string;
  defaultUnit: string;
  serviceFares: Record<string, { amount: number; unit: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPricingBody {
  vehicleType:   string;
  defaultAmount: number;
  defaultUnit:   string;
  serviceFares:  Record<string, { amount: number; unit: string }>;
}

type PricingListResponse   = { success: boolean; data: VehiclePricing[] };
type PricingSingleResponse = { success: boolean; data: VehiclePricing };

export async function getPricing(): Promise<VehiclePricing[]> {
  const res = await request<PricingListResponse>("/api/pricing");
  return res.data;
}

export async function upsertPricing(body: UpsertPricingBody): Promise<VehiclePricing> {
  const res = await request<PricingSingleResponse>("/api/pricing", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}
