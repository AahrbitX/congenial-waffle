"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRides } from "@/hooks/useRides";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { IconCar, IconLoader, IconChevronRight } from "@/constants/icons";
import type { RideFilter } from "@/types/ride.types";

const FILTERS: RideFilter[] = ["all", "completed", "cancelled"];

export function RidesTab() {
  const { data: rides = [], isLoading } = useRides();
  const [filter, setFilter] = useState<RideFilter>("all");
  const router = useRouter();

  const filtered = filter === "all" ? rides : rides.filter((r) => r.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader size={28} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-black text-[var(--color-text-primary)]">My Rides</p>
        <div className="flex gap-1 bg-[var(--color-surface-muted)] p-1 rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${filter === f ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-secondary)]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ride) => (
          <button
            key={ride.id}
            onClick={() => router.push(ROUTES.dashboard.ride(ride.id))}
            className="w-full text-left bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[var(--color-primary)] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ride.status === "completed" ? COLORS.success : COLORS.danger}`}>
                <IconCar size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{ride.from} → {ride.to}</p>
                  <StatusBadge status={ride.status} />
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{ride.date}</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{ride.vehicle !== "—" ? `${ride.vehicle} · ${ride.plate}` : "No vehicle"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[15px] font-black text-[var(--color-text-primary)]">{ride.fare > 0 ? `₹${ride.fare}` : "—"}</p>
                  {ride.rating > 0 && <p className="text-[11px] text-yellow-500">{"★".repeat(ride.rating)}</p>}
                </div>
                <IconChevronRight size={14} className="text-[var(--color-text-tertiary)]" />
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--color-text-tertiary)]">
            <IconCar size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-semibold">No rides found</p>
          </div>
        )}
      </div>
    </div>
  );
}
