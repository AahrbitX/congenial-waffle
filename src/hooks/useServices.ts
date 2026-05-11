import { useQuery } from "@tanstack/react-query";
import { getServices, getServiceBySlug } from "@/api/services.api";

export const SERVICES_KEY = ["services"] as const;

export function useServices() {
  return useQuery({ queryKey: SERVICES_KEY, queryFn: getServices });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: [...SERVICES_KEY, slug],
    queryFn: () => getServiceBySlug(slug),
    enabled: !!slug,
  });
}
