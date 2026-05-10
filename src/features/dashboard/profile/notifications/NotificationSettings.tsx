"use client";

import { useState } from "react";
import { Switch } from "@heroui/react";

const ITEMS = [
  { key: "rideUpdates", label: "Ride Updates",          sub: "Driver assigned, arriving, trip started" },
  { key: "promos",      label: "Offers & Promos",       sub: "Discounts, promo codes, new features"   },
  { key: "payments",    label: "Payment Alerts",        sub: "Receipts, wallet top-ups, deductions"   },
  { key: "whatsapp",    label: "WhatsApp Alerts",       sub: "Get ride updates on WhatsApp"           },
  { key: "email",       label: "Email Notifications",   sub: "Receipts and weekly summaries"          },
] as const;

type PrefKey = (typeof ITEMS)[number]["key"];

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    rideUpdates: true, promos: true, payments: true, whatsapp: false, email: true,
  });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl divide-y divide-[var(--color-border)] shadow-sm overflow-hidden">
      {ITEMS.map(({ key, label, sub }) => (
        <div key={key} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{label}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
          </div>
          <Switch
            isSelected={prefs[key]}
            onChange={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
            size="sm"
            classNames={{ track: prefs[key] ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]" }}
          />
        </div>
      ))}
    </div>
  );
}
