"use client";

import { useState, useEffect } from "react";
import { ListBox, Select, Skeleton, toast } from "@heroui/react";
import { usePricing, useUpsertPricing } from "@/hooks/usePricing";
import { useFleet } from "@/hooks/useFleet";
import type { FleetVehicle } from "@/types/fleet.types";
import { IconPlus, IconX, IconCheck, IconLoader } from "@/constants/icons";

const FARE_UNITS = ["per km", "flat", "per 8 hrs", "per day", "per week"] as const;
type FareUnit = (typeof FARE_UNITS)[number];

type ServiceRow   = { key: string; amount: number; unit: FareUnit };
type PricingState = { defaultAmount: number; defaultUnit: FareUnit; rows: ServiceRow[] };

function toUnit(u: string): FareUnit {
  return (FARE_UNITS as readonly string[]).includes(u) ? (u as FareUnit) : "per km";
}

const SERVICE_LABELS: Record<string, string> = {
  "city-taxi":            "City Taxi",
  "airport":              "Airport Transfer",
  "railway":              "Railway Transfer",
  "full-day-hire":        "Full Day Hire",
  "weekly-commute":       "Weekly Commute",
  "rent-a-car":           "Rent a Car",
  "outstation":           "Outstation",
  "outstation-oneway":    "Outstation One-Way",
  "outstation-roundtrip": "Outstation Round Trip",
  "nationwide":           "Nationwide",
  "wedding":              "Wedding",
  "tours":                "Tours",
  "events":               "Events",
  "tempo":                "Tempo Traveller",
};

// CSS-variable-based colors — keyed to globals.css vars
const CAT_COLOR: Record<string, string> = {
  Hatchback: "var(--color-primary)",
  Sedan:     "var(--color-purple)",
  MUV:       "var(--color-warning)",
  Luxury:    "var(--color-success)",
  Traveller: "var(--color-info)",
};

const UNIT_COLOR: Record<string, string> = {
  "per km":    "var(--color-primary)",
  "flat":      "var(--color-success)",
  "per 8 hrs": "var(--color-warning)",
  "per day":   "var(--color-purple)",
  "per week":  "var(--color-danger)",
};

const BLANK_PRICING: PricingState = { defaultAmount: 0, defaultUnit: "per km", rows: [] };


/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function PricingSettingsSkeleton() {
  return (
    <div className="flex flex-col md:flex-row rounded-2xl border border-border overflow-hidden bg-surface">
      <div className="md:w-56 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface-muted/40">
        <div className="px-4 py-3.5 border-b border-border">
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <div className="p-2 space-y-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="px-3 py-3 rounded-xl space-y-2">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                <Skeleton className={`h-3.5 rounded ${i % 3 === 0 ? "w-28" : i % 3 === 1 ? "w-36" : "w-32"}`} />
              </div>
              <div className="flex gap-1.5 pl-4">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3.5 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-surface-muted/20 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-24 rounded" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex gap-3 p-4 rounded-2xl border border-primary/15 bg-primary/5">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-2.5 w-20 rounded" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
              <div className="w-36 space-y-2">
                <Skeleton className="h-2.5 w-12 rounded" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
              <div className="self-end pb-0.5">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
interface Props { isLoading: boolean }

export default function PricingSettings({ isLoading }: Props) {
  const { data: dbPricing,     isLoading: fetchingPricing } = usePricing();
  const { data: fleetVehicles, isLoading: fetchingFleet   } = useFleet();
  const upsertPricing = useUpsertPricing();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pricingData, setPricingData] = useState<PricingState[]>([]);
  const [saved, setSaved] = useState(false);

  // Build pricing state when both fleet and DB pricing are loaded
  useEffect(() => {
    if (!fleetVehicles?.length) return;
    const dbMap = Object.fromEntries((dbPricing ?? []).map((p) => [p.vehicleType, p]));
    setPricingData(
      fleetVehicles.map((v: FleetVehicle) => {
        const db = dbMap[v.name];
        if (!db) return { ...BLANK_PRICING };
        return {
          defaultAmount: parseFloat(db.defaultAmount) || 0,
          defaultUnit:   toUnit(db.defaultUnit),
          rows: Object.entries(db.serviceFares as Record<string, { amount: number; unit: string }>).map(
            ([key, fare]) => ({ key, amount: fare.amount, unit: toUnit(fare.unit) }),
          ),
        };
      }),
    );
    setSelectedIdx((prev) => Math.min(prev, fleetVehicles.length - 1));
  }, [fleetVehicles, dbPricing]);

  const v       = fleetVehicles?.[selectedIdx] as FleetVehicle | undefined;
  const current = pricingData[selectedIdx] ?? BLANK_PRICING;

  const setDefault = (field: "defaultAmount" | "defaultUnit", value: number | FareUnit) =>
    setPricingData((p) => p.map((s, i) => i === selectedIdx ? { ...s, [field]: value } : s));

  const setRow = (rowIdx: number, field: keyof ServiceRow, value: string | number) =>
    setPricingData((p) =>
      p.map((s, i) => i === selectedIdx
        ? { ...s, rows: s.rows.map((r, j) => j === rowIdx ? { ...r, [field]: value } : r) }
        : s,
      ),
    );

  const addRow = () =>
    setPricingData((p) =>
      p.map((s, i) => i === selectedIdx
        ? { ...s, rows: [...s.rows, { key: "", amount: 0, unit: "per km" as FareUnit }] }
        : s,
      ),
    );

  const removeRow = (rowIdx: number) =>
    setPricingData((p) =>
      p.map((s, i) => i === selectedIdx
        ? { ...s, rows: s.rows.filter((_, j) => j !== rowIdx) }
        : s,
      ),
    );

  const handleSave = async () => {
    if (!v) return;
    const serviceFares = Object.fromEntries(
      current.rows
        .filter((r) => r.key.trim())
        .map((r) => [r.key.trim(), { amount: r.amount, unit: r.unit }]),
    );
    try {
      await upsertPricing.mutateAsync({
        vehicleType:   v.name,
        defaultAmount: current.defaultAmount,
        defaultUnit:   current.defaultUnit,
        serviceFares,
      });
      setSaved(true);
      toast.success(`Pricing updated for ${v.name}`);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast("Failed to save pricing", { variant: "danger" });
    }
  };

  const showSkeleton = isLoading || fetchingPricing || fetchingFleet;

  return (
    <div>
      {showSkeleton ? (
        <PricingSettingsSkeleton />
      ) : !fleetVehicles?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center">
          <p className="text-sm font-semibold text-text-secondary">No fleet vehicles found</p>
          <p className="text-xs text-text-tertiary mt-1">Add vehicles in Fleet Settings first.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row rounded-2xl border border-border overflow-hidden bg-surface">

          {/* ── Left nav ─────────────────────────────────────────────────── */}
          <div className="md:w-56 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface-muted/40 flex flex-col">
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Vehicle Types</p>
            </div>
            <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
              {(fleetVehicles ?? []).map((vehicle: FleetVehicle, i: number) => {
                const isActive  = i === selectedIdx;
                const hasDbData = (dbPricing ?? []).some((p) => p.vehicleType === vehicle.name);
                return (
                  <button key={vehicle.id} onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-surface-muted border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CAT_COLOR[vehicle.category] ?? "var(--color-text-muted)" }} />
                      <span className={`text-sm truncate font-medium ${isActive ? "text-primary font-semibold" : "text-text-primary"}`}>
                        {vehicle.name}
                      </span>
                      {!hasDbData && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning shrink-0 ml-auto">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 ml-4">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-primary/15 text-primary" : "bg-surface text-text-secondary"
                      }`}>
                        {vehicle.seats} seats
                      </span>
                      <span className={`text-[10px] font-medium ${isActive ? "text-primary/70" : "text-text-tertiary"}`}>
                        {vehicle.ac ? "AC" : "Non-AC"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ──────────────────────────────────────────────── */}
          {v && (
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 bg-surface-muted/20 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-text-primary">{v.name}</h2>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `color-mix(in srgb, ${CAT_COLOR[v.category] ?? "var(--color-text-muted)"} 12%, transparent)`, color: CAT_COLOR[v.category] ?? "var(--color-text-secondary)" }}
                    >
                      {v.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {v.tagline ?? v.category} · {current.rows.length} service fares configured
                  </p>
                </div>
                <button onClick={handleSave} disabled={upsertPricing.isPending}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shrink-0 shadow-sm disabled:opacity-60 ${
                    saved
                      ? "bg-success text-white shadow-success/30"
                      : "bg-primary text-white hover:bg-primary/90 shadow-primary/30 active:scale-95"
                  }`}
                >
                  {upsertPricing.isPending
                    ? <><IconLoader size={14} className="animate-spin" /> Saving…</>
                    : saved
                    ? <><IconCheck size={14} /> Saved!</>
                    : "Save Pricing"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Default fare */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Default Fare</p>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="flex gap-3 items-center p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/15">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide mb-1.5">Amount (₹)</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-text-secondary">₹</span>
                        <input type="number" min={0} value={current.defaultAmount}
                          onChange={(e) => setDefault("defaultAmount", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                      </div>
                    </div>
                    <div className="w-36 shrink-0">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide mb-1.5">Unit</p>
                      <select value={current.defaultUnit}
                        onChange={(e) => setDefault("defaultUnit", e.target.value as FareUnit)}
                        className="w-full rounded-xl border border-border bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                        {FARE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="shrink-0 self-end pb-0.5">
                      <span
                        className="text-[11px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: `color-mix(in srgb, ${UNIT_COLOR[current.defaultUnit] ?? "var(--color-text-muted)"} 12%, transparent)`, color: UNIT_COLOR[current.defaultUnit] ?? "var(--color-text-secondary)" }}
                      >
                        {current.defaultUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service fares */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Service Fares</p>
                    <div className="flex-1 h-px bg-border" />
                    <button onClick={addRow}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors">
                      <IconPlus size={12} /> Add fare
                    </button>
                  </div>

                  {current.rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-border text-center">
                      <p className="text-sm font-semibold text-text-secondary">No service fares yet</p>
                      <p className="text-xs text-text-tertiary mt-1 mb-3">Add fares for specific services like airport, outstation, etc.</p>
                      <button onClick={addRow}
                        className="flex items-center gap-2 text-xs text-primary font-semibold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
                        <IconPlus size={12} /> Add first fare
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {current.rows.map((row, idx) => (
                        <div key={idx}
                          className="group flex gap-3 items-start rounded-xl border border-border bg-surface-muted/30 hover:bg-surface-muted/60 px-4 py-3 transition-colors">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <Select
                              variant="secondary"
                              placeholder="— Select service —"
                              selectedKey={SERVICE_LABELS[row.key] ? row.key : row.key ? "__custom__" : ""}
                              onSelectionChange={(key) => {
                                if (key === "__custom__") {
                                  setRow(idx, "key", "");
                                } else {
                                  setRow(idx, "key", String(key));
                                }
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                                    <ListBox.Item key={key} id={key} textValue={label}>
                                      {label}
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                  <ListBox.Item key="__custom__" id="__custom__" textValue="Custom…">
                                    Custom…
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                </ListBox>
                              </Select.Popover>
                            </Select>
                            {/* Show text input when key doesn't match any predefined label */}
                            {row.key && !SERVICE_LABELS[row.key] && (
                              <input
                                type="text"
                                value={row.key}
                                onChange={(e) => setRow(idx, "key", e.target.value)}
                                placeholder="Enter custom service id"
                                className="w-full rounded-lg border border-primary/40 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            )}
                          </div>
                          <div className="w-24 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-text-secondary">₹</span>
                              <input type="number" min={0} value={row.amount}
                                onChange={(e) => setRow(idx, "amount", parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 px-2 py-1.5 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                            </div>
                          </div>
                          <select value={row.unit} onChange={(e) => setRow(idx, "unit", e.target.value)}
                            className="rounded-lg border border-border bg-white dark:bg-zinc-800 px-2 py-1.5 text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shrink-0">
                            {FARE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <button onClick={() => removeRow(idx)}
                            className="p-1.5 mt-0.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/10 transition-all shrink-0">
                            <IconX size={14} className="text-danger" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
