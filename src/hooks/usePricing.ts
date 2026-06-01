import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPricing, upsertPricing, type UpsertPricingBody } from "@/api/pricing.api";

export const PRICING_KEY = ["pricing"] as const;

export function usePricing() {
  return useQuery({ queryKey: PRICING_KEY, queryFn: getPricing });
}

export function useUpsertPricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertPricingBody) => upsertPricing(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRICING_KEY }),
  });
}
