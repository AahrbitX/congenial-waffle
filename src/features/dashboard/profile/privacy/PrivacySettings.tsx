"use client";

import { useState } from "react";
import { Switch, Avatar } from "@heroui/react";
import { IconShield } from "@/constants/icons";

const EMERGENCY_CONTACTS = [
  "Amit Sharma (+91 98001 23456)",
  "Sunita Sharma (+91 99887 65432)",
];

const TOGGLES = [
  {
    key: "locationShare",
    label: "Share Live Location",
    sub: "Let trusted contacts track your ride",
  },
  {
    key: "sos",
    label: "Emergency SOS",
    sub: "One-tap alert to contacts & police",
  },
  {
    key: "tripShare",
    label: "Trip Sharing",
    sub: "Auto-share trip details via WhatsApp",
  },
] as const;

type ToggleKey = (typeof TOGGLES)[number]["key"];

export function PrivacySettings() {
  const [prefs, setPrefs] = useState<Record<ToggleKey, boolean>>({
    locationShare: true,
    sos: true,
    tripShare: false,
  });
  const toggle = (k: ToggleKey) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl divide-y divide-[var(--color-border)] shadow-sm overflow-hidden">
        {TOGGLES.map(({ key, label, sub }) => (
          <div key={key} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-primary">{label}</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                {sub}
              </p>
            </div>
            <Switch
              isSelected={prefs[key]}
              onChange={() => toggle(key)}
              size="sm"
            >
              <Switch.Control
                className={
                  prefs[key]
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-border-strong)]"
                }
              >
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-[13px] font-bold text-primary mb-3 flex items-center gap-2">
          <IconShield size={15} className="text-[var(--color-primary)]" />{" "}
          Emergency Contacts
        </p>
        {EMERGENCY_CONTACTS.map((c) => (
          <div
            key={c}
            className="flex items-center gap-3 py-2.5 border-b last:border-0 border-[var(--color-border)]"
          >
            <Avatar size="sm">
              <Avatar.Fallback className="bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-[11px]">
                {c.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <span className="flex-1 text-[13px] text-[var(--color-text-secondary)]">
              {c}
            </span>
            <button className="text-[12px] text-[var(--color-danger)] font-semibold">
              Remove
            </button>
          </div>
        ))}
        <button className="w-full mt-3 py-2.5 border-2 border-dashed border-[var(--color-primary-light)] rounded-xl text-[13px] font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors">
          + Add Contact
        </button>
      </div>
    </div>
  );
}
