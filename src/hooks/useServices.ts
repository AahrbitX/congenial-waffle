import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  addServiceLocation,
  deleteServiceLocation,
} from "@/api/services.api";
import type { CreateServiceBody, UpdateServiceBody, AddLocationBody } from "@/types/service.types";

export const SERVICES_KEY = ["services"] as const;

export function useServices() {
  return useQuery({ queryKey: SERVICES_KEY, queryFn: getServices, staleTime: 1000 * 60 * 5 });
}

export function useService(slug: string | undefined) {
  return useQuery({
    queryKey: [...SERVICES_KEY, slug],
    queryFn: () => getServiceBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceBody) => createService(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: UpdateServiceBody }) =>
      updateService(slug, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteService(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useAddServiceLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: AddLocationBody }) =>
      addServiceLocation(slug, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useDeleteServiceLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, locationId }: { slug: string; locationId: string }) =>
      deleteServiceLocation(slug, locationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}
