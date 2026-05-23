"use client";

import { useDashboard } from "@/context/DashboardContext";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import {
  IconX,
  IconBell,
  IconCar,
  IconWallet,
  IconGift,
  IconShield,
} from "@/constants/icons";
import type { NotificationType } from "@/types/notification.types";
import { ElementType } from "react";

const ICON_MAP: Record<NotificationType, { icon: ElementType; cls: string }> = {
  ride: {
    icon: IconCar,
    cls: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  },
  payment: {
    icon: IconWallet,
    cls: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  },
  promo: {
    icon: IconGift,
    cls: "bg-[var(--color-purple-light)] text-[var(--color-purple)]",
  },
  safety: {
    icon: IconShield,
    cls: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  },
  info: {
    icon: IconBell,
    cls: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
  },
};

export function NotificationPanel() {
  const { notifOpen, closeNotifPanel } = useDashboard();
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAll } = useMarkAllRead();

  if (!notifOpen) return null;

  const today = notifications.filter((n) => n.group === "today");
  const earlier = notifications.filter((n) => n.group === "earlier");
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={closeNotifPanel}
      />
      <div className="w-[390px] bg-[var(--color-surface)] h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-black text-primary">
                Notifications
              </h2>
              {unread > 0 && (
                <span className="bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
              Stay up to date
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={() => markAll()}
                className="text-[12px] font-semibold text-[var(--color-primary)] hover:opacity-80"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={closeNotifPanel}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)]"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {[
            { label: "Today", items: today },
            { label: "Earlier", items: earlier },
          ].map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label}>
                <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase px-5 py-2">
                  {label}
                </p>
                {items.map((n) => {
                  const { icon: Icon, cls } = ICON_MAP[n.type] ?? ICON_MAP.info;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-5 py-3.5 border-b border-[var(--color-border)] ${!n.read ? "bg-[var(--color-primary-light)]/40" : "hover:bg-[var(--color-surface-muted)]"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative ${cls}`}
                      >
                        <Icon size={18} />
                        {!n.read && (
                          <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] text-primary ${!n.read ? "font-bold" : "font-semibold"}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-[12px] text-[var(--color-text-secondary)] leading-snug mt-0.5">
                          {n.body}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ),
          )}
          {notifications.length === 0 && (
            <div className="text-center py-16 text-[var(--color-text-tertiary)]">
              <IconBell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
