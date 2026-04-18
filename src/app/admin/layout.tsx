"use client";

import { buttonVariants } from "@heroui/styles";
import { CalendarCheck, LayoutDashboard, Star, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Tabs, Tab } from "@heroui/react";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className="h-screen">
      <div className="grid w-full h-full grid-rows-[52px_1fr] md:grid-cols-[216px_1fr] bg-background md:p-2 rounded-2xl">
        {/* Header */}
        <div className="col-span-2 border-b border-divider p-2 px-4 flex items-center font-bold uppercase tracking-tight">
          <Link href={"/"}>MohanCabs</Link>
        </div>

        {/* Sidebar (Desktop Only) */}
        <div className="border-r border-divider py-4 px-2 hidden md:block">
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathName === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-start gap-2 px-3 py-2 w-full ${buttonVariants({ variant: isActive ? "secondary" : "ghost" })}`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="px-2 md:p-4 overflow-y-auto col-span-2 md:col-span-1">
          {/* Mobile Navigation (Tabs as Links) */}
          <div className="md:hidden">
            <Tabs
              aria-label="Navigation"
              selectedKey={pathName}
              variant="secondary"
              className="mb-2 w-full pt-2"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Options">
                  {navLinks.map((link) => (
                    <Tab
                      key={link.href}
                      onPress={() => router.push(link.href)}
                      className={`${pathName === link.href ? "text-accent" : ""} `}
                    >
                      {link.name}
                    </Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>

          <section className="pt-2">{children}</section>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
