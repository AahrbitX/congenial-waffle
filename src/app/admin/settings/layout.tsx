"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Surface } from "@heroui/react";
import { IconSettings } from "@/constants/icons";

const TABS = [
  { label: "Personal Info", href: "/admin/settings/personal-info" },
  { label: "Fleets", href: "/admin/settings/fleets" },
  { label: "Pricing", href: "/admin/settings/pricing" },
  { label: "Services", href: "/admin/settings/services" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(href + "/") ||
    (pathname === "/admin/settings" && href.includes("personal-info"));

  return (
    <Surface
      className="h-full min-h-0 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto"
      variant="secondary"
    >
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-accent  flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
          <IconSettings size={21} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-accent">Settings</h1>
          <p className="text-sm text-muted">
            Manage your profile, fleet vehicles, and service pricing.
          </p>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-0 border-b border-border -mb-5">
        {TABS.map(({ label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-accent hover:border-border"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 pt-4 pb-10">{children}</div>
    </Surface>
  );
}
