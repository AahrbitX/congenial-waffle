"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useRides } from "@/hooks/useRides";
import { authClient } from "@/lib/auth-client";
import { useUserStats } from "@/hooks/useUser";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboard } from "@/context/DashboardContext";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { UpcomingRideCard } from "@/components/dashboard/UpcomingRideCard";
import { OngoingRideCard } from "@/components/dashboard/OngoingRideCard";
import { RateDriverBanner } from "@/components/dashboard/RateDriverBanner";
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
  IconTicket,
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
  Tooltip,
} from "@heroui/react";
import { STATUS_COLOR } from "@/types/ride.types";
import { OverviewSkeleton } from "./OverviewTabSkeleton";

// ─── OverviewTab ──────────────────────────────────────────────────────────────

export function OverviewTab() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const PAGE_SIZE = 8;

  const [bookOpen, setBookOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // tanstack query hooks
  const { data: rides = [], isLoading: ridesLoading } = useRides();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { openRatingModal, openTicketModal } = useDashboard();

  // Ongoing ride takes priority — driver has started the trip
  const ongoingRide = rides.find((r) => r.status === "ongoing") ?? null;

  // Upcoming ride: nearest future pending/confirmed ride (shown only if no ongoing ride)
  const now = Date.now();
  const upcomingRide = !ongoingRide
    ? (rides
        .filter((r) => {
          if (r.status !== "pending" && r.status !== "confirmed") return false;
          const rideAt = new Date(
            `${r.journeyDate}T${r.journeyTime}`,
          ).getTime();
          return rideAt > now;
        })
        .sort((a, b) => {
          const dtA = new Date(`${a.journeyDate}T${a.journeyTime}`).getTime();
          const dtB = new Date(`${b.journeyDate}T${b.journeyTime}`).getTime();
          return dtA - dtB;
        })[0] ?? null)
    : null;

  // Show banner only if the most recent completed ride has no rating in DB
  const lastCompletedRide = rides.find((r) => r.status === "completed") ?? null;
  const needsRatingRide =
    lastCompletedRide && lastCompletedRide.rating === 0
      ? lastCompletedRide
      : null;
  const filteredRides = rides
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter(
      (r) =>
        search === "" ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.from.toLowerCase().includes(search.toLowerCase()) ||
        r.to.toLowerCase().includes(search.toLowerCase()),
    )
    ;

  // Reset to page 1 when any filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRides.length / PAGE_SIZE));
  const pagedRides = filteredRides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const parseDate = (date: string) => {
    const dateObj = new Date(date);

    // Format the date part (e.g., "Apr 23, 2026")
    const datePart = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    // Format the time part (e.g., "07:05 PM")
    const timePart = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <Tooltip delay={0}>
        <Tooltip.Trigger>{datePart}</Tooltip.Trigger>
        <Tooltip.Content showArrow offset={12}>
          <Tooltip.Arrow />
          {datePart} at {timePart}
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (statsLoading || ridesLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <Surface className="h-auto space-y-6 px-4 py-4 sm:px-6" variant="secondary">
      {/* ── Stat Cards ── */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
              label="Total Spent"
              value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
              sub="All time"
              icon={IconWallet}
              colorClass="bg-green-500 text-white"
            />
            <StatCard
              label="Your Rating"
              value={stats.ratingCount > 0 ? `${stats.rating} ★` : "—"}
              sub={
                stats.ratingCount > 0
                  ? `${stats.ratingCount} ratings`
                  : "No ratings yet"
              }
              icon={IconStar}
              colorClass="bg-yellow-500 text-white"
            />
          </div>
          {stats.totalRides === 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-sm text-text-secondary">
                You haven&apos;t taken any rides yet. Book your first ride!
              </p>
              <Button size="sm" onPress={() => setBookOpen(true)}>
                <IconPlus size={14} />
                Book a Ride
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Ongoing Ride (driver has started the trip) ── */}
      {ongoingRide && (
        <OngoingRideCard ride={ongoingRide} onEndTrip={openRatingModal} />
      )}

      {/* ── Upcoming Ride (shown only when no ride is in progress) ── */}
      {upcomingRide && <UpcomingRideCard ride={upcomingRide} />}

      {/* ── Rate Driver Banner ── */}
      {needsRatingRide && (
        <RateDriverBanner ride={needsRatingRide} onRate={openRatingModal} />
      )}

      {/* ── Rides Table / Cards ── */}
      <Card className="mb-2 flex flex-col">
        {/* Toolbar — sticky header */}
        <div className="shrink-0 flex flex-col gap-3 border-b border-[var(--color-border)] pb-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
            <Input
              variant="secondary"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56"
            />
            <Tabs onSelectionChange={(key) => setStatusFilter(String(key))}>
              <Tabs.ListContainer className="w-full text-sm overflow-x-scroll scrollbar-hide">
                <Tabs.List aria-label="Filter by status">
                  <Tabs.Tab id="all">All<Tabs.Indicator /></Tabs.Tab>
                  <Tabs.Tab id="ongoing">Ongoing<Tabs.Indicator /></Tabs.Tab>
                  <Tabs.Tab id="completed">Completed<Tabs.Indicator /></Tabs.Tab>
                  <Tabs.Tab id="cancelled">Cancelled<Tabs.Indicator /></Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </div>

        {/* ── Mobile card list (hidden on sm+) ── */}
        <div className="sm:hidden overflow-y-auto mt-3 space-y-2" style={{ maxHeight: "calc(100svh - 380px)" }}>
          {ridesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-border p-4">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
            ))
          ) : filteredRides.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              {search || statusFilter !== "all" ? (
                <>
                  <IconSearch size={28} className="text-muted" />
                  <p className="font-semibold">No rides found</p>
                  <p className="text-sm text-muted">Try adjusting your search or filter.</p>
                </>
              ) : (
                <>
                  <IconCar size={28} className="text-muted" />
                  <p className="font-semibold">No rides yet</p>
                  <p className="text-sm text-muted">Book your first ride to get started.</p>
                  <Button size="sm" onPress={() => setBookOpen(true)}>
                    <IconPlus size={14} /> Book a Ride
                  </Button>
                </>
              )}
            </div>
          ) : (
            pagedRides.map((ride) => (
              <Link
                key={ride.id}
                href={`/dashboard/rides/${ride.id}`}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted transition-colors"
              >
                {/* Icon */}
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <IconCar size={18} className="text-primary" />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-primary">#{ride.bookingRef}</span>
                    <Chip
                      color={STATUS_COLOR[ride.status as keyof typeof STATUS_COLOR] ?? "warning"}
                      size="sm"
                      variant="soft"
                    >
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </Chip>
                  </div>
                  <p className="text-sm text-foreground truncate mt-1">
                    {ride.from} → {ride.to}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted flex-wrap">
                    <span>
                      {new Date(ride.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {ride.driver && (
                      <>
                        <span>·</span>
                        <span>{ride.driver}</span>
                      </>
                    )}
                    {ride.fare > 0 && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-foreground">₹{ride.fare}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* ── Desktop table (hidden on mobile, unchanged) ── */}
        <div className="hidden sm:block">
          <Table>
            <div className="max-h-[350px] overflow-y-auto overflow-x-auto scrollbar-hide [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10">
              <Table.Content aria-label="My rides" className="min-w-[700px]">
                <Table.Header>
                  <Table.Column isRowHeader id="id">Booking ID</Table.Column>
                  <Table.Column id="route">Route</Table.Column>
                  <Table.Column id="date">Date</Table.Column>
                  <Table.Column id="driver">Driver</Table.Column>
                  <Table.Column id="status">Status</Table.Column>
                  <Table.Column id="fare">Fare</Table.Column>
                </Table.Header>
                <Table.Body
                  renderEmptyState={() =>
                    !ridesLoading && (
                      <EmptyState className="my-10 flex flex-col items-center gap-3 text-center">
                        {search || statusFilter !== "all" ? (
                          <>
                            <IconSearch size={28} className="text-muted" />
                            <p className="font-semibold">No rides found</p>
                            <p className="text-sm text-muted">Try adjusting your search or filter.</p>
                          </>
                        ) : (
                          <>
                            <IconCar size={28} className="text-muted" />
                            <p className="font-semibold">No rides yet</p>
                            <p className="text-sm text-muted">Book your first ride to get started.</p>
                            <Button size="sm" onPress={() => setBookOpen(true)}>
                              <IconPlus size={14} /> Book a Ride
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
                          <Table.Cell><Skeleton className="h-4 w-36 rounded-lg" /></Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <Skeleton className="size-8 shrink-0 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-20 rounded-lg" />
                                <Skeleton className="h-3 w-16 rounded-lg" />
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell><Skeleton className="h-6 w-20 rounded-full" /></Table.Cell>
                          <Table.Cell><Skeleton className="h-6 w-20 rounded-full" /></Table.Cell>
                          <Table.Cell><Skeleton className="h-4 w-12 rounded-lg" /></Table.Cell>
                        </Table.Row>
                      ))
                    : pagedRides.map((ride) => (
                        <Table.Row key={ride.id} id={ride.id}>
                          <Table.Cell className="font-medium">
                            <Link className="flex items-center gap-2" href={`/dashboard/rides/${ride.id}`}>
                              <span className="text-accent font-semibold hover:underline">{"#" + ride.bookingRef}</span>
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2" title={`${ride.from} -- ${ride.to}`}>
                              <span className="max-w-[320px] line-clamp-1">{ride.from}</span>
                              <IconArrowLeftRight size={14} className="text-muted" />
                              <span className="max-w-[320px] line-clamp-1">{ride.to}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>{parseDate(ride.date)}</Table.Cell>
                          <Table.Cell>
                            {ride.driver ? (
                              <span className="text-sm font-medium">{ride.driver}</span>
                            ) : (
                              <span className="text-muted text-sm">Unassigned</span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Chip
                              color={STATUS_COLOR[ride.status as keyof typeof STATUS_COLOR] ?? "warning"}
                              size="sm"
                              variant="soft"
                            >
                              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                            </Chip>
                          </Table.Cell>
                          <Table.Cell>{ride.fare > 0 ? `₹${ride.fare}` : "—"}</Table.Cell>
                        </Table.Row>
                      ))}
                </Table.Body>
              </Table.Content>
            </div>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-1">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-muted disabled:opacity-30 hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              ‹ Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = startPage + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                      p === page
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-muted disabled:opacity-30 hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              Next ›
            </button>
          </div>
        )}
      </Card>

      <BookRideModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={() => {}}
      />
    </Surface>
  );
}
