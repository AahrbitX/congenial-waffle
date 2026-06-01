"use client";

import { useRouter } from "next/navigation";
import { Card, Tabs } from "@heroui/react";

import { useRides } from "@/hooks/useRides";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { COLORS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import { IconCar, IconLoader, IconChevronRight } from "@/constants/icons";
import { ArrowRight } from "lucide-react";
import { dateParser } from "@/utils/DateParser";

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
    <div className="space-y-2 max-md:px-2 max-md:mt-4">
      <Tabs defaultSelectedKey="all">
        <Tabs.ListContainer>
          <div className="flex items-center justify-between flex-wrap">
            <p></p>
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
            <Tabs.Panel
              key={filter}
              id={filter}
              className="pt-2 space-y-3 px-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((ride) => (
                  <Card
                    key={ride.id}
                    onClick={() => router.push(ROUTES.dashboard.ride(ride.id))}
                    className="group cursor-pointer p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Card.Content className="flex h-full flex-col gap-4 p-4">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                              ride.status === "completed"
                                ? COLORS.success
                                : ride.status === "cancelled"
                                  ? COLORS.danger
                                  : "bg-primary text-white"
                            }`}
                          >
                            <IconCar size={18} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-foreground">
                              {ride.from}
                            </h3>

                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                              <ArrowRight size={12} />
                              <span className="truncate">{ride.to}</span>
                            </div>
                          </div>
                        </div>

                        <StatusBadge status={ride.status} />
                      </div>

                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-3 ">
                        <div className="min-w-0">
                          <p className="text-xs text-muted">Vehicle</p>

                          <p className="mt-1 truncate text-sm font-semibold text-foreground">
                            {ride.vehicle !== "—" ? ride.vehicle : "Unassigned"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-muted">Plate</p>

                          <p className="mt-1 truncate text-sm font-semibold text-foreground">
                            {ride.plate || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="mt-auto flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-muted">Ride Date</p>

                          <p className="mt-1 text-sm font-medium text-foreground">
                            {dateParser(ride.date)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted">
                            Fare
                          </p>

                          <p className="mt-1 text-3xl font-bold text-foreground">
                            {ride.fare > 0 ? `₹${ride.fare}` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-medium text-muted">
                          Your Rating
                        </span>
                        {ride.rating > 0 ? (
                          <div className="flex items-center gap-0.5 text-sm text-yellow-500">
                            {"★".repeat(ride.rating)}
                          </div>
                        ) : (
                          <p>-</p>
                        )}
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-muted">
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
