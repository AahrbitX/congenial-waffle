"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRides } from "@/hooks/useRides";
import { useUserStats } from "@/hooks/useUser";
import { useDashboard } from "@/context/DashboardContext";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActiveTripCard } from "@/components/dashboard/ActiveTripCard";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import { greeting } from "@/lib/dashboard/helpers";
import { COLORS } from "@/constants/colors";
import { IconCar, IconCalendar, IconWallet, IconStar, IconChevronRight, IconGift, IconPlus, IconLoader } from "@/constants/icons";

export function OverviewTab() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { data: rides = [], isLoading: ridesLoading } = useRides();
  const { data: stats, isLoading: statsLoading }      = useUserStats();
  const { activeTrip, setActiveTrip, openRatingModal } = useDashboard();
  const [bookOpen, setBookOpen] = useState(false);
  const [booked, setBooked]     = useState(false);

  if (statsLoading || ridesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader size={28} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const recentRides = rides.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-full bg-white/10 rounded-bl-[60px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-[13px] font-medium">{greeting()},</p>
          <p className="text-white text-[22px] font-black tracking-tight">{user?.name ?? "Traveller"} 👋</p>
          <p className="text-blue-100 text-[13px] mt-1">Ready for your next ride?</p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold rounded-xl px-5 py-3 text-[14px] transition-colors"
        >
          Book a Ride →
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Rides"  value={String(stats.totalRides)}    sub="All time"         icon={IconCar}      colorClass={COLORS.primary}  />
          <StatCard label="This Month"   value={String(stats.thisMonth)}     sub={stats.monthLabel} icon={IconCalendar} colorClass={COLORS.purple}   />
          <StatCard label="Wallet"       value={`₹${stats.walletBalance}`}   sub="Available"        icon={IconWallet}   colorClass={COLORS.success}  />
          <StatCard label="Your Rating"  value={`${stats.rating} ★`}         sub={`${stats.ratingCount} ratings`} icon={IconStar} colorClass={COLORS.warning} />
        </div>
      )}

      {/* Active trip */}
      {(activeTrip || booked) && (
        <ActiveTripCard onEnd={() => { setActiveTrip(false); setBooked(false); openRatingModal(rides[0]); }} />
      )}

      {/* Pending feedback nudge */}
      {!activeTrip && !booked && rides.length > 1 && (
        <button
          onClick={() => openRatingModal(rides[1])}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-primary-light)] hover:border-[var(--color-primary)] transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
            <IconStar size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[var(--color-text-primary)]">Rate your last ride</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">{rides[1].from} → {rides[1].to} · {rides[1].date}</p>
          </div>
          <IconChevronRight size={15} className="text-[var(--color-primary)]" />
        </button>
      )}

      {/* Recent rides */}
      <div>
        <p className="text-[15px] font-black text-[var(--color-text-primary)] mb-3">Recent Rides</p>
        <div className="space-y-3">
          {recentRides.map((ride) => (
            <div key={ride.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ride.status === "completed" ? COLORS.success : ride.status === "cancelled" ? COLORS.danger : COLORS.primary}`}>
                <IconCar size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-[13px] font-bold text-[var(--color-text-primary)] truncate">{ride.from} → {ride.to}</p>
                  <StatusBadge status={ride.status} />
                </div>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{ride.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black text-[var(--color-text-primary)]">{ride.fare > 0 ? `₹${ride.fare}` : "—"}</p>
                {ride.status === "completed" && ride.rating === 0 && (
                  <button onClick={() => openRatingModal(ride)} className="text-[11px] text-[var(--color-primary)] font-semibold hover:underline mt-0.5">Rate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Book Ride",     icon: IconCar,   action: () => setBookOpen(true) },
          { label: "Add Money",     icon: IconPlus,  action: () => {} },
          { label: "My Promotions", icon: IconGift,  action: () => {} },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action} className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center">
              <Icon size={18} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{label}</span>
          </button>
        ))}
      </div>

      <BookRideModal isOpen={bookOpen} onClose={() => setBookOpen(false)} onBooked={() => setBooked(true)} />
    </div>
  );
}
