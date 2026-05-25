"use client";

import Link from "next/link";
import { useState } from "react";

import { useRides } from "@/hooks/useRides";
import { authClient } from "@/lib/auth-client";
import { useUserStats } from "@/hooks/useUser";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboard } from "@/context/DashboardContext";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { ActiveTripCard } from "@/components/dashboard/ActiveTripCard";
import {
  IconCar,
  IconCalendar,
  IconWallet,
  IconStar,
  IconPlus,
  IconArrowLeftRight,
  IconCopy,
  IconEye,
  IconSearch,
} from "@/constants/icons";
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Skeleton,
  Surface,
  Table,
  Tabs,
} from "@heroui/react";
import { STATUS_COLOR } from "@/types/ride.types";
import { OverviewSkeleton } from "./OverviewTabSkeleton";

// ─── OverviewTab ──────────────────────────────────────────────────────────────

export function OverviewTab() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [bookOpen, setBookOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // tanstack query hooks
  const { data: rides = [], isLoading: ridesLoading } = useRides();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { activeTrip, setActiveTrip, openRatingModal } = useDashboard();

  const filteredRides = rides
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter(
      (r) =>
        search === "" ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.from.toLowerCase().includes(search.toLowerCase()) ||
        r.to.toLowerCase().includes(search.toLowerCase()),
    );

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (statsLoading || ridesLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <Surface className="h-auto space-y-6" variant="secondary">
      {/* ── Stat Cards ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Rides"
            value={String(stats.totalRides)}
            sub="All time"
            icon={IconCar}
            colorClass="bg-accent text-white"
          />
          <StatCard
            label="This Month"
            value={String(stats.thisMonth)}
            sub={stats.monthLabel}
            icon={IconCalendar}
            colorClass="bg-violet-500 text-white"
          />
          <StatCard
            label="Wallet"
            value={`₹${stats.walletBalance}`}
            sub="Available"
            icon={IconWallet}
            colorClass="bg-green-500 text-white"
          />
          <StatCard
            label="Your Rating"
            value={`${stats.rating} ★`}
            sub={`${stats.ratingCount} ratings`}
            icon={IconStar}
            colorClass="bg-yellow-500 text-white"
          />
        </div>
      )}

      {/* ── Active Trip ── */}
      {(activeTrip || booked) && (
        <ActiveTripCard
          onEnd={() => {
            setActiveTrip(false);
            setBooked(false);
            openRatingModal(rides[0]);
          }}
        />
      )}

      {/* ── Rides Table ── */}
      <Card className="mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              variant="secondary"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Tabs onSelectionChange={(key) => setStatusFilter(String(key))}>
              <Tabs.ListContainer className="w-full max-w-[440px] text-sm overflow-x-scroll">
                <Tabs.List aria-label="Filter by status">
                  <Tabs.Tab id="all">
                    All
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="ongoing">
                    On Trip
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="completed">
                    Completed
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="cancelled">
                    Cancelled
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </div>

        {/* Scrollable table body — 5 rows visible, scroll for the rest */}
        <Table>
          <div className="max-h-[350px] overflow-y-auto overflow-x-auto scrollbar-hide [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10">
            <Table.Content aria-label="My rides" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader id="id">
                  Booking ID
                </Table.Column>
                <Table.Column id="route">Route</Table.Column>
                <Table.Column id="driver">Driver</Table.Column>
                <Table.Column id="status">Status</Table.Column>
                <Table.Column id="fare">Fare</Table.Column>
                <Table.Column className="text-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() =>
                  !ridesLoading && (
                    <EmptyState className="my-10 flex flex-col items-center gap-3 text-center">
                      {search || statusFilter !== "all" ? (
                        <>
                          <IconSearch size={28} className="text-muted" />
                          <p className="font-semibold">No rides found</p>
                          <p className="text-sm text-muted">
                            Try adjusting your search or filter.
                          </p>
                        </>
                      ) : (
                        <>
                          <IconCar size={28} className="text-muted" />
                          <p className="font-semibold">No rides yet</p>
                          <p className="text-sm text-muted">
                            Book your first ride to get started.
                          </p>
                          <Button size="sm" onPress={() => setBookOpen(true)}>
                            <IconPlus size={14} />
                            Book a Ride
                          </Button>
                        </>
                      )}
                    </EmptyState>
                  )
                }
              >
                {ridesLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Table.Row key={`skel-${i}`} id={`skel-${i}`}>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-14 rounded-lg" />
                            <Skeleton className="size-6 rounded-lg" />
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-4 w-36 rounded-lg" />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="size-8 shrink-0 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-20 rounded-lg" />
                              <Skeleton className="h-3 w-16 rounded-lg" />
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </Table.Cell>
                        <Table.Cell>
                          <Skeleton className="h-4 w-12 rounded-lg" />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-end">
                            <Skeleton className="size-8 rounded-lg" />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  : filteredRides.map((ride) => (
                      <Table.Row key={ride.id} id={ride.id}>
                        {/* Booking ID + copy */}
                        <Table.Cell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{"#" + ride.id}</span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              onPress={() => handleCopy(ride.id)}
                              aria-label="Copy booking ID"
                            >
                              <IconCopy
                                size={14}
                                className={
                                  copiedId === ride.id
                                    ? "text-success"
                                    : "text-muted"
                                }
                              />
                            </Button>
                          </div>
                        </Table.Cell>

                        {/* Route */}
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <span>{ride.from}</span>
                            <IconArrowLeftRight
                              size={14}
                              className="text-muted"
                            />
                            <span>{ride.to}</span>
                          </div>
                        </Table.Cell>

                        {/* Driver with avatar */}
                        <Table.Cell>
                          {ride.driver ? (
                            <div className="flex items-center gap-3">
                              <Avatar size="sm">
                                <Avatar.Fallback>
                                  {ride.driver
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </Avatar.Fallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {ride.driver}
                                </span>
                                <span className="text-xs text-muted">
                                  {ride.driverPhone}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted text-sm">
                              Unassigned
                            </span>
                          )}
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell>
                          <Chip
                            color={
                              STATUS_COLOR[
                                ride.status as keyof typeof STATUS_COLOR
                              ] ?? "warning"
                            }
                            size="sm"
                            variant="soft"
                          >
                            {ride.status.charAt(0).toUpperCase() +
                              ride.status.slice(1)}
                          </Chip>
                        </Table.Cell>

                        {/* Fare */}
                        <Table.Cell className="font-bold">
                          {ride.fare > 0 ? `₹${ride.fare}` : "—"}
                        </Table.Cell>

                        {/* Actions */}
                        <Table.Cell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="tertiary"
                              aria-label="View ride"
                            >
                              <Link href={`/dashboard/rides/${ride.id}`}>
                                <IconEye size={15} />
                              </Link>
                            </Button>
                            {ride.status === "completed" &&
                              ride.rating === 0 && (
                                <Button
                                  size="sm"
                                  variant="tertiary"
                                  onPress={() => openRatingModal(ride)}
                                >
                                  <IconStar size={15} />
                                  Rate
                                </Button>
                              )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
              </Table.Body>
            </Table.Content>
          </div>
        </Table>
      </Card>

      <BookRideModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={() => setBooked(true)}
      />
    </Surface>
  );
}
