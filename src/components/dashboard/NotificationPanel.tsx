"use client";

import { Drawer, Button } from "@heroui/react";

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
import type { ElementType } from "react";

const ICON_MAP: Record<NotificationType, { icon: ElementType; cls: string }> = {
  ride: {
    icon: IconCar,
    cls: "bg-blue-50 text-blue-600",
  },
  payment: {
    icon: IconWallet,
    cls: "bg-green-50 text-green-600",
  },
  promo: {
    icon: IconGift,
    cls: "bg-violet-50 text-violet-600",
  },
  safety: {
    icon: IconShield,
    cls: "bg-red-50 text-red-600",
  },
  info: {
    icon: IconBell,
    cls: "bg-zinc-100 text-zinc-600",
  },
};

export function NotificationPanel() {
  const { notifOpen, closeNotifPanel } = useDashboard();
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAll } = useMarkAllRead();
  const today = notifications.filter((n) => n.group === "today");
  const earlier = notifications.filter((n) => n.group === "earlier");
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Drawer isOpen={notifOpen} onOpenChange={closeNotifPanel}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-full">
          <Drawer.Dialog className="flex h-full flex-col p-4">
            {/* Header */}
            <Drawer.Header className="border-b border-zinc-200 pb-2">
              <div className="flex w-full items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Drawer.Heading className="text-base font-semibold">
                      Notifications
                    </Drawer.Heading>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => markAll()}
                      className=""
                    >
                      Mark all read
                    </Button>
                  )}

                  <Button
                    isIconOnly
                    size="sm"
                    variant="outline"
                    slot="close"
                    className="rounded-xl"
                  >
                    <IconX size={16} />
                  </Button>
                </div>
              </div>
            </Drawer.Header>

            {/* Body */}
            <Drawer.Body className="flex-1 overflow-y-auto">
              {[
                {
                  label: "Today",
                  items: today,
                },
                {
                  label: "Earlier",
                  items: earlier,
                },
              ].map(({ label, items }) =>
                items.length === 0 ? null : (
                  <div key={label}>
                    <div className=" py-2">
                      <p className="text-sm font-semibold text-muted">
                        {label}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {items.map((n) => {
                        const { icon: Icon, cls } =
                          ICON_MAP[n.type] ?? ICON_MAP.info;

                        return (
                          <div
                            key={n.id}
                            className={`flex cursor-pointer gap-3 rounded-2xl px-3 py-3 transition-colors ${
                              !n.read
                                ? "bg-primary/20 text-primary-foreground"
                                : "bg-muted/20 text-foreground"
                            }`}
                          >
                            <div
                              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cls}`}
                            >
                              <Icon size={18} />

                              {!n.read && (
                                <div className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`line-clamp-1 text-sm text-black ${
                                    !n.read ? "font-bold" : "font-semibold"
                                  }`}
                                >
                                  {n.title}
                                </p>

                                <p className="shrink-0 text-xs text-zinc-400">
                                  {n.time}
                                </p>
                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                                {n.body}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}

              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                    <IconBell size={26} />
                  </div>

                  <p className="text-sm font-semibold text-zinc-900">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    We&apos;ll notify you about rides, payments and updates.
                  </p>
                </div>
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
