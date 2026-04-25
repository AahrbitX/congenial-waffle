"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  Car,
  LayoutDashboard,
  Star,
  User,
  Users,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Dispatchers", href: "/admin/dispatchers", icon: Users },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Drivers", href: "/admin/drivers", icon: Car },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className="h-screen">
      <div className="grid w-full h-full grid-rows-[52px_1fr] md:grid-cols-[216px_1fr] bg-background rounded-2xl">
        {/* Header */}
        <div className="col-span-2 border-b border-divider p-2 px-4 flex items-center font-bold uppercase tracking-tight">
          <Link href={"/"}>MohanCabs</Link>
        </div>

        {/* Sidebar (Desktop Only) */}
        <div className="border-r border-divider py-4 px-2 hidden md:block">
          <nav className="space-y-2">
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
                    className: `flex items-center justify-start gap-2 px-3 py-2 rounded-lg ${isActive ? "bg-accent text-white" : ""}`,
                  })}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden min-h-0 col-span-2 md:col-span-1">
          <section className="w-full h-full min-h-0">{children}</section>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
