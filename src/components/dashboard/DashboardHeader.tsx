"use client";

import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useDashboard } from "@/context/DashboardContext";
import { useNotifications } from "@/hooks/useNotifications";
import { greeting } from "@/lib/dashboard/helpers";
import { ROUTES } from "@/constants/routes";
import { IconBell } from "@/constants/icons";

const PAGE_META: Record<
  string,
  { title: string; subFn?: (name: string) => string }
> = {
  [ROUTES.dashboard.overview]: {
    title: "Overview",
    subFn: (n) => `${greeting()}, ${n}`,
  },
  [ROUTES.dashboard.rides]: {
    title: "My Rides",
    subFn: () => "View and manage your trip history",
  },
  [ROUTES.dashboard.wallet]: {
    title: "Wallet",
    subFn: () => "Manage your balance and payments",
  },
  [ROUTES.dashboard.profile.root]: {
    title: "Profile",
    subFn: () => "Manage your account details",
  },
  [ROUTES.dashboard.profile.privacy]: { title: "Privacy & Safety" },
  [ROUTES.dashboard.profile.notifications]: { title: "Notifications" },
  [ROUTES.dashboard.profile.help]: { title: "Help & Support" },
  [ROUTES.dashboard.profile.refer]: { title: "Refer & Earn" },
  [ROUTES.dashboard.profile.preferences]: { title: "Preferences" },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { openNotifPanel } = useDashboard();
  const { data: notifications } = useNotifications();

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const meta = PAGE_META[pathname] ?? { title: "Dashboard" };
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold ">{meta.title}</h1>
        {meta.subFn && (
          <p className="text-sm text-muted">{meta.subFn(firstName)}</p>
        )}
      </div>
      <button
        onClick={openNotifPanel}
        className="relative p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all"
      >
        <IconBell size={18} className="text-[var(--color-text-secondary)]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
        )}
      </button>
    </div>
  );
}
