"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { Card, Skeleton } from "@heroui/react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  IndianRupee,
} from "lucide-react";

import { BookingPerformanceChart } from "@/components/charts/BookingPerformanceChart";
import { VehiclePerformanceChart } from "@/components/charts/VehiclePerformanceChart";
import { RidesTable } from "./components/ridesTable";
import { useDashboardCharts } from "@/hooks/dashboard";
import { ResponsiveSurface } from "@/components/ui/ResponsiveSurface";

// ── Stat cards ────────────────────────────────────────────────────────────────
const STAT_DEFS = [
  {
    key:   "todayBookings",
    label: "Today's Rides",
    icon:  CalendarCheck,
    color: "text-blue-600",
    bg:    "bg-blue-50 dark:bg-blue-950/30",
    format: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    key:   "completed",
    label: "Total Completed",
    icon:  CheckCircle,
    color: "text-emerald-600",
    bg:    "bg-emerald-50 dark:bg-emerald-950/30",
    format: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    key:   "pending",
    label: "Pending Rides",
    icon:  Clock,
    color: "text-amber-600",
    bg:    "bg-amber-50 dark:bg-amber-950/30",
    format: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    key:   "totalRevenue",
    label: "Total Revenue",
    icon:  IndianRupee,
    color: "text-violet-600",
    bg:    "bg-violet-50 dark:bg-violet-950/30",
    format: (v: number) =>
      `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
  },
] as const;

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <Card.Content className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function AdminPage() {
  const { data: authData }   = authClient.useSession();
  const { data: chartsData, isLoading } = useDashboardCharts();

  const summary = chartsData?.summary;

  return (
    <ResponsiveSurface className="min-h-full py-4" variant="secondary">
      {/* Header */}
      <div className="px-4 md:px-0 mb-4">
        <h1 className="text-xl font-semibold">
          Welcome Back, {authData?.user.name || "Admin"}
        </h1>
        <p className="text-sm text-muted">
          Here&apos;s what&apos;s happening with Mohan Cabs today.
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <StatCardsSkeleton />
      ) : summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {STAT_DEFS.map(({ key, label, icon: Icon, color, bg, format }) => {
            const rawVal  = summary[key as keyof typeof summary];
            const numVal  = typeof rawVal === "string" ? parseFloat(rawVal) : Number(rawVal);
            return (
              <Card key={key}>
                <Card.Content className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div>
                      <p className="text-xs text-muted">{label}</p>
                      <p className="text-xl font-bold">{format(numVal)}</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
        <BookingPerformanceChart
          data={chartsData?.dailyRides}
          isLoading={isLoading}
        />
        <VehiclePerformanceChart
          data={chartsData?.vehicleStats}
          isLoading={isLoading}
        />
      </div>

      {/* Rides table */}
      <div>
        <RidesTable />
      </div>
    </ResponsiveSurface>
  );
}

export default AdminPage;
