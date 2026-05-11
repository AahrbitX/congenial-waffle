export type NotificationType = "ride" | "payment" | "promo" | "safety" | "info";
export type NotificationGroup = "today" | "earlier";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  group: NotificationGroup;
  read: boolean;
}
