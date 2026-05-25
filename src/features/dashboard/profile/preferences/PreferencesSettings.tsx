"use client";

import { useState } from "react";
import { Switch } from "@heroui/react";

const LANGUAGES = ["English", "हिन्दी", "മലയാളം", "தமிழ்"];

export function PreferencesSettings() {
  const [lang, setLang] = useState("English");
  const [ac, setAc] = useState(true);
  const [compact, setCompact] = useState(false);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <p className="text-[11px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase mb-3">
          Language
        </p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${lang === l ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {[
        {
          label: "Prefer AC rides",
          sub: "Always book AC vehicles when available",
          on: ac,
          set: setAc,
        },
        {
          label: "Compact trip cards",
          sub: "Show shorter cards in ride history",
          on: compact,
          set: setCompact,
        },
      ].map(({ label, sub, on, set }) => (
        <div
          key={label}
          className="flex items-center gap-4 px-5 py-4 border-b last:border-0 border-[var(--color-border)]"
        >
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-primary">{label}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
              {sub}
            </p>
          </div>
          <Switch isSelected={on} onChange={() => set(!on)} size="sm">
            <Switch.Control
              className={
                on
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
  );
}
