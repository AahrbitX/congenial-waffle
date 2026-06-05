"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useDashboard } from "@/context/DashboardContext";
import { useNotifications } from "@/hooks/useNotifications";
import { greeting } from "@/lib/dashboard/helpers";
import { ROUTES } from "@/constants/routes";
import { ASSETS } from "@/constants/assets";
import { IconBell } from "@/constants/icons";
import { Button } from "@heroui/react";

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
  [ROUTES.dashboard.transactions]: {
    title: "Transactions",
    subFn: () => "Your ride payment history and pending dues",
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
      <div className="flex items-center gap-2.5">
        {/* Logo — mobile only */}
        <Link href="/" className="lg:hidden shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src={ASSETS.logos.minimal.src}
            alt={ASSETS.logos.minimal.alt}
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
        </Link>
        <div>
          <h1 className="text-lg font-bold leading-tight">{meta.title}</h1>
          {meta.subFn && (
            <p className="hidden sm:block text-xs text-muted leading-tight">{meta.subFn(firstName)}</p>
          )}
        </div>
      </div>
      <Button
        isIconOnly
        variant="ghost"
        onClick={openNotifPanel}
        isDisabled
        className="opacity-40 pointer-events-none"
      >
        <IconBell size={14} className="text-muted" />
      </Button>
    </div>
  );
}
