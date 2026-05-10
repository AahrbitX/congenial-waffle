import { MOCK_NOTIFICATIONS } from "@/data/notifications.mock";
import type { Notification } from "@/types/notification.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

let _notifications = [...MOCK_NOTIFICATIONS];

export async function getNotifications(): Promise<Notification[]> {
  await delay();
  return _notifications;
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  await delay(200);
  _notifications = _notifications.map((n) => ({ ...n, read: true }));
  return _notifications;
}
