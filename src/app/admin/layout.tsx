"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@heroui/styles";
import { authClient } from "@/lib/auth-client";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import AddBookings from "./bookings/addBookings";
import { MobileFloatingNav } from "@/components/ui/MobileFloatingNav";
import UserDropdown from "@/components/nav/userDropdown";
import { ASSETS } from "@/constants/assets";

const navLinks = [
  { name: "Dashboard",   href: "/admin",             icon: LayoutDashboard },
  { name: "Bookings",    href: "/admin/bookings",    icon: CalendarCheck },
  { name: "Dispatchers", href: "/admin/dispatchers", icon: Users },
  { name: "Users",       href: "/admin/users",       icon: User },
  { name: "Drivers",     href: "/admin/drivers",     icon: Car },
  { name: "Payments",    href: "/admin/payments",    icon: BadgeIndianRupee },
  { name: "Reviews",     href: "/admin/reviews",     icon: Star },
  { name: "Settings",    href: "/admin/settings",    icon: Settings },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const router   = useRouter();

  // waitForSession() in the login forms populates the session atom before
  // router.push(), so useSession() reads it synchronously here — no extra
  // network request, no bounce.
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const hideSidebar = pathName === "/admin";

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (isPending) return;
    if (role === "admin") return;
    router.replace(role === "user" ? "/dashboard" : "/login");
  }, [isPending, role]);

  if (isPending || role !== "admin") return null;

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex flex-col w-full h-full bg-background">

        {/* ── Header ── */}
        <div className="h-16 shrink-0 border-b border-divider px-4 flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline", isIconOnly: true })}
            href="/"
          >
            <Home size={12} />
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <Image src={ASSETS.logos.minimal.src} alt={ASSETS.logos.minimal.alt} width={30} height={30} />
            <Image src={ASSETS.logos.darkFullName.src} alt={ASSETS.logos.darkFullName.alt} width={110} height={28} className="object-contain" />
          </div>
          <UserDropdown showDashboard={false} hideLoginButton />
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Sidebar (desktop) ── */}
          <div
            className={`relative hidden md:block shrink-0 transition-[width] duration-200 ${
              collapsed ? "w-14" : "w-[216px]"
            }`}
          >
            {/* Panel (overflow-hidden hides text during width transition) */}
            <div className={`flex flex-col h-full border-r border-divider py-4 overflow-hidden ${
              collapsed ? "px-1" : "px-2"
            }`}>
              {/* Nav links */}
              <nav className="flex-1 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathName === link.href ||
                    (link.href !== "/admin" && pathName.startsWith(link.href));

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      title={collapsed ? link.name : undefined}
                      className={buttonVariants({
                        variant:    isActive ? "secondary" : "ghost",
                        isIconOnly: collapsed,
                        fullWidth:  !collapsed,
                        className: `${isActive ? "bg-accent text-white" : ""} ${
                          collapsed
                            ? "justify-center"
                            : "justify-start gap-2 px-3 py-2"
                        }`,
                      })}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{link.name}</span>}
                    </Link>
                  );
                })}
              </nav>

              {/* Add booking */}
              <div className="mt-4 pt-4 border-t border-divider">
                {collapsed ? (
                  <AddBookings iconOnly className="w-full rounded-xl" />
                ) : (
                  <AddBookings className="w-full rounded-xl" />
                )}
              </div>
            </div>

            {/* Collapse toggle — sits on the right border at the top */}
            <button
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full bg-background border border-divider shadow-sm flex items-center justify-center text-muted hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <section className={`h-full overflow-y-auto min-h-0 ${hideSidebar ? "scrollbar-hide" : ""}`}>
              {children}
            </section>
          </div>
        </div>

        <MobileFloatingNav />
      </div>
    </div>
  );
}

export default AdminLayout;
