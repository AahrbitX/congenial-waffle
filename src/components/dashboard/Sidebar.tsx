"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useNotifications } from "@/hooks/useNotifications";
import { useDashboard } from "@/context/DashboardContext";
import { ROUTES } from "@/constants/routes";
import {
  IconDashboard,
  IconCar,
  IconReceipt,
  IconUser,
  IconBell,
} from "@/constants/icons";
import { Button, buttonVariants } from "@heroui/react";

const NAV_ITEMS = [
  { label: "Overview", href: ROUTES.dashboard.overview, icon: IconDashboard },
  { label: "My Rides", href: ROUTES.dashboard.rides, icon: IconCar },
  { label: "Transactions", href: ROUTES.dashboard.transactions, icon: IconReceipt },
  { label: "Profile", href: ROUTES.dashboard.profile.root, icon: IconUser },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { data: notifications } = useNotifications();
  const { openNotifPanel } = useDashboard();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <aside className="w-[var(--sidebar-width)] shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] min-h-screen flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
            <IconCar size={15} className="text-white" />
          </div> */}
          <span className="font-bold text-xl">Mohan Cabs</span>
        </div>
        {/* <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">My Dashboard</p> */}
      </div>

      {/* User */}
      {/* <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 bg-[var(--color-surface-muted)] rounded-xl p-3">
          <Avatar size="sm">
            <Avatar.Fallback className="bg-[var(--color-primary)] text-white font-black text-[12px]">
              {initials(user?.name)}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--color-text-primary)] truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
      </div> */}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== ROUTES.dashboard.overview && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={buttonVariants({
                variant: isActive ? "secondary" : "ghost",
                fullWidth: true,
                className: `flex items-center justify-start gap-2 px-3 py-2 rounded-lg ${
                  isActive ? "bg-accent text-white" : ""
                }`,
              })}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <Button
          onPress={openNotifPanel}
          className={""}
          fullWidth
          variant="secondary"
        >
          <IconBell size={16} />
          Notifications
          {unread > 0 && (
            <span className="ml-auto w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}
