import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsRead } from "@/api/notifications.api";

export const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications() {
  return useQuery({ queryKey: NOTIFICATIONS_KEY, queryFn: getNotifications });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (data) => qc.setQueryData(NOTIFICATIONS_KEY, data),
  });
}
