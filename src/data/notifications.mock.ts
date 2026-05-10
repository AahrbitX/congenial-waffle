import type { Notification } from "@/types/notification.types";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "ride",
    title: "Ride Completed",
    body: "Your trip to Railway Station is done. Fare: ₹180.",
    time: "9:38 AM",
    group: "today",
    read: false,
  },
  {
    id: 2,
    type: "payment",
    title: "Wallet Credited",
    body: "₹500 added to your Mohan Cabs wallet.",
    time: "8:00 AM",
    group: "today",
    read: false,
  },
  {
    id: 3,
    type: "promo",
    title: "You earned ₹100!",
    body: "Friend Amit joined via your referral code.",
    time: "Yesterday",
    group: "earlier",
    read: true,
  },
  {
    id: 4,
    type: "ride",
    title: "Ride Cancelled",
    body: "Your booking on 2 May was cancelled.",
    time: "2 May",
    group: "earlier",
    read: true,
  },
  {
    id: 5,
    type: "safety",
    title: "Safety check",
    body: "Rate your recent trip to help driver quality.",
    time: "3 May",
    group: "earlier",
    read: true,
  },
];
