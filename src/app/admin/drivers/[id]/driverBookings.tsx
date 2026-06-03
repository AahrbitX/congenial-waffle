"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Skeleton, Tabs } from "@heroui/react";
import { RefreshCcw } from "lucide-react";
import { request } from "@/lib/api-client";
import { IconCar } from "@/constants/icons";

const STATUS_COLOR: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
  completed: "success",
  ongoing:   "accent",
  confirmed: "accent",
  pending:   "warning",
  cancelled: "danger",
};

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="border-b border-border bg-surface px-4 py-3 flex gap-8">
        {["w-12", "w-32", "w-24", "w-20", "w-16", "w-20"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w} rounded`} />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-8 px-4 py-4 border-b border-border last:border-0">
          <Skeleton className="h-3 w-12 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function DriverBookingsTab({ driverId }: { driverId: string }) {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["driver-bookings", driverId],
    queryFn: () => request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/bookings?driverId=${driverId}&pageSize=50`
    ),
  });

  const rides = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id="bookings">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-muted">{rides.length} ride{rides.length !== 1 ? "s" : ""}</p>
        <Button isIconOnly variant="ghost" size="sm" onPress={() => refetch()} isDisabled={isFetching}>
          <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : rides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-default/60 flex items-center justify-center">
            <IconCar size={24} className="text-muted" />
          </div>
          <p className="text-sm font-semibold">No rides yet</p>
          <p className="text-xs text-muted">This driver hasn&apos;t been assigned any rides.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-semibold text-muted uppercase tracking-wide">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rides.map((ride: any) => (
                <tr key={ride.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{ride.bookingRef}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="truncate font-medium">{ride.pickupName ?? "—"}</p>
                    <p className="truncate text-xs text-muted">{ride.dropName ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                    {ride.journeyDate
                      ? new Date(ride.journeyDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                    <br /><span>{ride.journeyTime ?? ""}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{ride.vehicleType}</td>
                  <td className="px-4 py-3 font-semibold">₹{ride.fare}</td>
                  <td className="px-4 py-3">
                    <Chip size="sm" color={STATUS_COLOR[ride.status] ?? "default"} variant="soft">
                      {ride.status}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tabs.Panel>
  );
}
