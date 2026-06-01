"use client";

import { useState, useEffect } from "react";
import { Skeleton, toast } from "@heroui/react";
import { MOCK_VEHICLES } from "@/data/booking.mock";
import { usePricing, useUpsertPricing } from "@/hooks/usePricing";
import { IconPlus, IconX, IconCheck, IconLoader } from "@/constants/icons";

const FARE_UNITS = ["per km", "flat", "per 8 hrs", "per day", "per week"] as const;
type FareUnit = (typeof FARE_UNITS)[number];

type ServiceRow   = { key: string; amount: number; unit: FareUnit };
type PricingState = { defaultAmount: number; defaultUnit: FareUnit; rows: ServiceRow[] };

function toUnit(u: string): FareUnit {
  return (FARE_UNITS as readonly string[]).includes(u) ? (u as FareUnit) : "per km";
}

function mockToPricingState(v: (typeof MOCK_VEHICLES)[number]): PricingState {
  return {
    defaultAmount: v.defaultFare.amount,
    defaultUnit:   toUnit(v.defaultFare.unit),
    rows: Object.entries(v.serviceFares).map(([key, fare]) => ({ key, amount: fare.amount, unit: toUnit(fare.unit) })),
  };
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

const CAT_DOT: Record<string, string> = {
  Hatchback: "bg-blue-500",
  Sedan:     "bg-violet-500",
  MUV:       "bg-amber-500",
  Luxury:    "bg-yellow-500",
  Traveller: "bg-teal-500",
};
const CAT_BADGE: Record<string, string> = {
  Hatchback: "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  Sedan:     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  MUV:       "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  Luxury:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Traveller: "bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300",
};
const UNIT_BADGE: Record<string, string> = {
  "per km":    "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  "flat":      "bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300",
  "per 8 hrs": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "per day":   "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "per week":  "bg-pink-100   text-pink-700   dark:bg-pink-900/40   dark:text-pink-300",
};

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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-28 rounded" />
              <div className="flex-1 h-px bg-border" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start rounded-xl border border-border px-4 py-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <div className="w-24 flex items-center gap-1">
                    <Skeleton className="h-4 w-3 rounded" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              ))}
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
  const { data: dbPricing = [], isLoading: fetching } = usePricing();
  const upsertPricing = useUpsertPricing();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pricingData, setPricingData] = useState<PricingState[]>(
    () => MOCK_VEHICLES.map(mockToPricingState),
  );
  const [saved, setSaved] = useState(false);

  // When DB pricing loads, merge into local state (DB overrides mock defaults)
  useEffect(() => {
    if (dbPricing.length === 0) return;
    const dbMap = Object.fromEntries(dbPricing.map((p) => [p.vehicleType, p]));
    setPricingData(
      MOCK_VEHICLES.map((v) => {
        const db = dbMap[v.type];
        if (!db) return mockToPricingState(v);
        return {
          defaultAmount: parseFloat(db.defaultAmount) || 0,
          defaultUnit:   toUnit(db.defaultUnit),
          rows: Object.entries(db.serviceFares).map(([key, fare]) => ({
            key, amount: fare.amount, unit: toUnit(fare.unit),
          })),
        };
      }),
    );
  }, [dbPricing]);

  const v       = MOCK_VEHICLES[selectedIdx];
  const current = pricingData[selectedIdx];

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
    const serviceFares = Object.fromEntries(
      current.rows
        .filter((r) => r.key.trim())
        .map((r) => [r.key.trim(), { amount: r.amount, unit: r.unit }]),
    );
    try {
      await upsertPricing.mutateAsync({
        vehicleType:   v.type,
        defaultAmount: current.defaultAmount,
        defaultUnit:   current.defaultUnit,
        serviceFares,
      });
      setSaved(true);
      toast.success(`Pricing updated for ${v.type}`);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast("Failed to save pricing", { variant: "danger" });
    }
  };

  const showSkeleton = isLoading || fetching;

  return (
    <div>
      {showSkeleton ? (
        <PricingSettingsSkeleton />
      ) : (
        <div className="flex flex-col md:flex-row rounded-2xl border border-border overflow-hidden bg-surface">

          {/* ── Left nav ─────────────────────────────────────────────────── */}
          <div className="md:w-56 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface-muted/40 flex flex-col">
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Vehicle Types</p>
            </div>
            <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
              {MOCK_VEHICLES.map((vehicle, i) => {
                const isActive  = i === selectedIdx;
                const hasDbData = dbPricing.some((p) => p.vehicleType === vehicle.type);
                return (
                  <button key={vehicle.type} onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-surface-muted border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${CAT_DOT[vehicle.category] ?? "bg-zinc-400"}`} />
                      <span className={`text-sm truncate font-medium ${isActive ? "text-primary font-semibold" : "text-text-primary"}`}>
                        {vehicle.type}
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
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 bg-surface-muted/20 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-text-primary">{v.type}</h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${CAT_BADGE[v.category] ?? "bg-surface-muted text-text-secondary"}`}>
                    {v.category}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {v.desc} · {current.rows.length} service fares configured
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
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${UNIT_BADGE[current.defaultUnit] ?? "bg-surface-muted text-text-secondary"}`}>
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
                        <div className="flex-1 min-w-0">
                          <input type="text" value={row.key}
                            onChange={(e) => setRow(idx, "key", e.target.value)}
                            placeholder="service-id (e.g. airport)"
                            className="w-full rounded-lg border border-border bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                          {row.key && SERVICE_LABELS[row.key] && (
                            <p className="text-[11px] text-text-secondary mt-1 pl-0.5 font-medium">
                              → {SERVICE_LABELS[row.key]}
                            </p>
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
        </div>
      )}
    </div>
  );
}
