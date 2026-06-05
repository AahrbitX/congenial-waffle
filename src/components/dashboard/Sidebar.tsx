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
  IconPlus,
} from "@/constants/icons";

import { Button, buttonVariants } from "@heroui/react";
import Image from "next/image";
import { ASSETS } from "@/constants/assets";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: ROUTES.dashboard.overview,
    icon: IconDashboard,
  },
  {
    label: "Rides",
    href: ROUTES.dashboard.rides,
    icon: IconCar,
  },
  {
    label: "Transactions",
    href: ROUTES.dashboard.transactions,
    icon: IconReceipt,
  },
  {
    label: "Profile",
    href: ROUTES.dashboard.profile.root,
    icon: IconUser,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const { data: session } = authClient.useSession();
  const { data: notifications } = useNotifications();
  const { openNotifPanel, openBookModal } = useDashboard();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[250px] shrink-0 border-r border-border bg-surface min-h-screen sticky top-0 h-screen flex-col">
        {/* Logo */}
        <div className="border-b border-border px-6 py-5">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src={ASSETS.logos.minimal.src}
              alt={ASSETS.logos.minimal.alt}
              width={24}
              height={24}
              className="w-10 h-6 rounded-full"
            />
            <p className="text-base font-bold">Mohan Cabs</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-2">
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
                  className: `
                    justify-start gap-3 rounded-xl px-4 text-sm 
                    ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-surface-muted hover:text-foreground"
                    }
                  `,
                })}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-2 border-t border-border p-3">
          <Button fullWidth variant="secondary" isDisabled className="">
            <IconBell size={17} />
            Notifications
            <span className="ml-auto text-xs text-muted">Soon</span>
          </Button>

          <Button fullWidth onPress={openBookModal} className="">
            <IconPlus size={16} />
            Book Ride
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 lg:hidden">
        <div className="relative flex h-16 items-center justify-between px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }, index) => {
            const isActive =
              pathname === href ||
              (href !== ROUTES.dashboard.overview && pathname.startsWith(href));

            const baseClass = `flex flex-1 items-center justify-center`;

            /* add spacing around floating center button */
            const spacingClass =
              index === 1 ? "mr-5" : index === 2 ? "ml-5" : "";

            return (
              <div key={href} className={`${baseClass} ${spacingClass}`}>
                <Link
                  href={href}
                  className={`flex flex-col items-center justify-center gap-1 transition-all ${
                    isActive
                      ? "text-primary"
                      : "text-text-secondary hover:text-primary"
                  }`}
                >
                  <Icon size={20} />

                  <span className="text-xs font-medium">{label}</span>
                </Link>
              </div>
            );
          })}

          {/* Floating Add Booking Button */}
          <button
            onClick={openBookModal}
            className="absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-2xl ring-4 ring-background transition-transform active:scale-95"
          >
            <IconPlus size={24} />
          </button>
        </div>
      </div>
    </>
  );
}
