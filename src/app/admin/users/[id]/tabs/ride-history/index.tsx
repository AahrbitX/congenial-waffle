"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Skeleton, Table, Tabs } from "@heroui/react";
import { request } from "@/lib/api-client";
import { IconCar } from "@/constants/icons";
import Link from "next/link";
import StatusIndicator from "@/components/data/statusIndicator";

const STATUS_COLOR: Record<
  string,
  "success" | "warning" | "danger" | "default" | "accent"
> = {
  completed: "success",
  ongoing: "accent",
  confirmed: "accent",
  pending: "warning",
  cancelled: "danger",
};

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-4 py-3">
        <Skeleton className="h-3 col-span-2 rounded" />
        <Skeleton className="h-3 col-span-4 rounded" />
        <Skeleton className="h-3 col-span-2 rounded" />
        <Skeleton className="h-3 col-span-2 rounded" />
        <Skeleton className="h-3 col-span-1 rounded" />
        <Skeleton className="h-3 col-span-1 rounded" />
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-border last:border-0"
        >
          <Skeleton className="h-4 col-span-2 rounded" />

          <div className="col-span-4 space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>

          <Skeleton className="h-4 col-span-2 rounded" />
          <Skeleton className="h-4 col-span-2 rounded" />
          <Skeleton className="h-4 col-span-1 rounded" />
          <Skeleton className="h-6 col-span-1 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-default/60 flex items-center justify-center">
        <IconCar size={24} className="text-muted" />
      </div>
      <p className="text-sm font-semibold text-foreground">No rides yet</p>
      <p className="text-xs text-muted max-w-xs">
        This user hasn&apos;t taken any rides.
      </p>
    </div>
  );
}

export default function RideHistoryTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-bookings", userId],
    queryFn: () =>
      request<{ success: boolean; data: any[]; pagination: any }>(
        `/api/bookings?userId=${userId}&pageSize=50`,
      ),
  });

  const rides = data?.data ?? [];

  return (
    <Tabs.Panel className="pt-2 px-0" id="ride-history">
      {isLoading ? (
        <LoadingSkeleton />
      ) : rides.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Ride history" className="min-w-[900px]">
              <Table.Header>
                <Table.Column isRowHeader>Ref</Table.Column>
                <Table.Column>Route</Table.Column>
                <Table.Column>Date</Table.Column>
                <Table.Column>Vehicle</Table.Column>
                <Table.Column>Fare</Table.Column>
                <Table.Column>Status</Table.Column>
              </Table.Header>

              <Table.Body>
                {rides.map((ride: any) => (
                  <Table.Row key={ride.id}>
                    <Table.Cell>
                      <Link
                        href={`/admin/bookings/${ride.id}`}
                        className="font-mono text-sm text-accent font-bold hover:underline cursor-pointer underline-offset-2"
                      >
                        {ride.bookingRef}
                      </Link>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="w-full">
                        <p className="truncate font-medium text-sm">
                          {ride.pickupName ?? "—"}
                        </p>

                        <p className="truncate text-xs text-text-tertiary">
                          {ride.dropName ?? "—"}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="text-sm flex items-center gap-2">
                        <p>
                          {ride.journeyDate
                            ? new Date(ride.journeyDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                        <p className="text-text-tertiary">
                          {ride.journeyTime ?? "—"}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="text-sm">{ride.vehicleType ?? "—"}</span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="font-semibold">
                        ₹{Number(ride.fare ?? 0).toLocaleString("en-IN")}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <StatusIndicator status={ride.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </Tabs.Panel>
  );
}
