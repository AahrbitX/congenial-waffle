"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@heroui/styles";
import { authClient } from "@/lib/auth-client";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Car,
  LayoutDashboard,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import AddBookings from "./bookings/addBookings";
import UserDropdown from "@/components/nav/userDropdown";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Dispatchers", href: "/admin/dispatchers", icon: Users },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Drivers", href: "/admin/drivers", icon: Car },
  { name: "Payments", href: "/admin/payments", icon: BadgeIndianRupee },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const role = (session?.user as any)?.role as string | undefined;

  useEffect(() => {
    if (isPending) return;
    if (role !== "admin") router.replace(role === "user" ? "/dashboard" : "/");
  }, [role, isPending]);

  // Only block when role is confirmed wrong — avoids SSR/client hydration mismatch
  // (Server renders with session from cookie; client starts with isPending=true, must match)
  if (!isPending && role !== "admin") return null;

  return (
    <div className="h-screen overflow-hidden">
      <div className="grid w-full h-full grid-rows-[52px_1fr] md:grid-cols-[216px_1fr] bg-background rounded-2xl">
        {/* Header */}
        <div className="col-span-2 border-b border-divider p-2 px-4 flex items-center justify-between font-bold uppercase tracking-tight">
          <Link href={"/"}>MohanCabs</Link>
          <UserDropdown showDashboard={false} />
        </div>

        {/* Sidebar (Desktop Only) */}
        <div className="hidden md:flex flex-col border-r border-divider py-4 px-2">
          <nav className="space-y-2 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon;

              const isActive =
                pathName === link.href ||
                (link.href !== "/admin" && pathName.startsWith(link.href));

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    fullWidth: true,
                    className: `flex items-center justify-start gap-2 px-3 py-2 rounded-lg ${
                      isActive ? "bg-accent text-white" : ""
                    }`,
                  })}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-divider mt-4">
            <AddBookings className="w-full rounded-xl" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-0 overflow-hidden col-span-2 md:col-span-1">
          <section className="h-full overflow-y-auto min-h-0">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
