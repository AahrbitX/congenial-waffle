"use client";

import { useRouter } from "next/navigation";
import { Card, Tabs } from "@heroui/react";

import { useRides } from "@/hooks/useRides";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { IconCar, IconLoader, IconChevronRight } from "@/constants/icons";

type RideFilter = "all" | "completed" | "cancelled";

const FILTERS: RideFilter[] = ["all", "completed", "cancelled"];

export function RidesTab() {
  const { data: rides = [], isLoading } = useRides();

  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader
          size={28}
          className="animate-spin text-[var(--color-primary)]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Tabs defaultSelectedKey="all">
        <Tabs.ListContainer>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Rides</h2>
            <Tabs.List
              aria-label="Ride filters"
              className="p-1 rounded-2xl max-w-sm"
            >
              {FILTERS.map((filter) => (
                <Tabs.Tab key={filter} id={filter} className="capitalize px-4">
                  {filter}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </div>
        </Tabs.ListContainer>

        {FILTERS.map((filter) => {
          const filtered =
            filter === "all"
              ? rides
              : rides.filter((ride) => ride.status === filter);

          return (
            <Tabs.Panel key={filter} id={filter} className="pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((ride) => (
                  <Card
                    key={ride.id}
                    onClick={() => router.push(ROUTES.dashboard.ride(ride.id))}
                    className="p-0"
                  >
                    <Card.Content className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex size-12 items-center justify-center rounded-2xl ${
                            ride.status === "completed"
                              ? COLORS.success
                              : ride.status === "cancelled"
                                ? COLORS.danger
                                : "bg-[var(--color-accent)] text-white"
                          }`}
                        >
                          <IconCar size={20} />
                        </div>

                        <StatusBadge status={ride.status} />
                      </div>

                      <div className="space-y-1">
                        <h3 className="line-clamp-1 text-base font-bold text-[var(--color-text-primary)]">
                          {ride.from}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                          <span>→</span>
                          <span className="line-clamp-1">{ride.to}</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                              Vehicle
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {ride.vehicle !== "—"
                                ? ride.vehicle
                                : "Not Assigned"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                              Plate
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {ride.plate || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-2">
                        <div>
                          <p className="text-xs mb-1 text-muted">Ride Date</p>

                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {ride.date}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted">Fare</p>

                          <p className="text-2xl font-black text-[var(--color-text-primary)]">
                            {ride.fare > 0 ? `₹${ride.fare}` : "—"}
                          </p>
                        </div>
                      </div>

                      {ride.rating > 0 && (
                        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                          <span className="text-xs font-medium text-[var(--color-text-muted)]">
                            Your Rating
                          </span>

                          <span className="text-sm text-yellow-500">
                            {"★".repeat(ride.rating)}
                          </span>
                        </div>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-[var(--color-text-muted)]">
                  <IconCar size={32} className="mx-auto mb-3 opacity-30" />

                  <p className="text-[14px] font-semibold">No rides found</p>
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
}
