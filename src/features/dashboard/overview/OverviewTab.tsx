"use client";

import { useState } from "react";

import { useRides } from "@/hooks/useRides";
import { authClient } from "@/lib/auth-client";
import { useUserStats } from "@/hooks/useUser";
import { greeting } from "@/lib/dashboard/helpers";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { ActiveTripCard } from "@/components/dashboard/ActiveTripCard";
import {
  IconCar,
  IconCalendar,
  IconWallet,
  IconStar,
  IconChevronRight,
  IconGift,
  IconPlus,
  IconLoader,
} from "@/constants/icons";
import { Button, Card } from "@heroui/react";

export function OverviewTab() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [bookOpen, setBookOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  const { data: rides = [], isLoading: ridesLoading } = useRides();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { activeTrip, setActiveTrip, openRatingModal } = useDashboard();

  if (statsLoading || ridesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const recentRides = rides.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-primary rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-full bg-white/10 rounded-bl-[60px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-medium">{greeting()},</p>
          <p className="text-white text-lg font-bold ">
            {user?.name ?? "Traveller"} 👋
          </p>
          <p className="text-blue-100 text-xs mt-1">
            Ready for your next ride?
          </p>
        </div>
        <Button
          onClick={() => setBookOpen(true)}
          className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl transition-colors"
        >
          Book a Ride →
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Rides"
            value={String(stats.totalRides)}
            sub="All time"
            icon={IconCar}
            colorClass={"bg-accent text-white"}
          />
          <StatCard
            label="This Month"
            value={String(stats.thisMonth)}
            sub={stats.monthLabel}
            icon={IconCalendar}
            colorClass={"bg-violet-500 text-white"}
          />
          <StatCard
            label="Wallet"
            value={`₹${stats.walletBalance}`}
            sub="Available"
            icon={IconWallet}
            colorClass={"bg-green-500 text-white"}
          />
          <StatCard
            label="Your Rating"
            value={`${stats.rating} ★`}
            sub={`${stats.ratingCount} ratings`}
            icon={IconStar}
            colorClass={"bg-yellow-500 text-white"}
          />
        </div>
      )}

      {/* Active trip */}
      {(activeTrip || booked) && (
        <ActiveTripCard
          onEnd={() => {
            setActiveTrip(false);
            setBooked(false);
            openRatingModal(rides[0]);
          }}
        />
      )}

      {/* Pending feedback nudge */}
      {!activeTrip && !booked && rides.length > 1 && (
        <Card
          onClick={() => openRatingModal(rides[1])}
          className="w-full flex items-center gap-3 flex-row cursor-pointer hover:bg-accent/10 transition-colors duration-150"
        >
          <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shrink-0">
            <IconStar size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold ">Rate your last ride</p>
            <p className="text-xs ">
              {rides[1].from} → {rides[1].to} · {rides[1].date}
            </p>
          </div>
          <IconChevronRight size={18} className="text-accent" />
        </Card>
      )}

      {/* Recent rides */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Rides</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-3 gap-4">
          {recentRides.map((ride) => (
            <Card
              key={ride.id}
              className="flex flex-row items-center gap-4 rounded-2xl p-4 shadow-sm"
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                  ride.status === "completed"
                    ? "bg-success text-white"
                    : ride.status === "cancelled"
                      ? "bg-danger text-white"
                      : "bg-accent text-white"
                }`}
              >
                <IconCar size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {ride.from} → {ride.to}
                      </p>

                      <StatusBadge status={ride.status} />
                    </div>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {ride.date}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold leading-none">
                      {ride.fare > 0 ? `₹${ride.fare}` : "—"}
                    </p>

                    {ride.status === "completed" && ride.rating === 0 && (
                      <button
                        onClick={() => openRatingModal(ride)}
                        className="mt-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Rate Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Book Ride",
            icon: IconCar,
            action: () => setBookOpen(true),
          },
          { label: "Add Money", icon: IconPlus, action: () => {} },
          { label: "My Promotions", icon: IconGift, action: () => {} },
        ].map(({ label, icon: Icon, action }) => (
          <Card
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-2 py-4 cursor-pointer hover:bg-accent/20 transition-colors duration-300"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
              <Icon size={26} className="" />
            </div>
            <span className="font-semibold text-[var(--color-text-secondary)]">
              {label}
            </span>
          </Card>
        ))}
      </div>

      <BookRideModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={() => setBooked(true)}
      />
    </div>
  );
}
