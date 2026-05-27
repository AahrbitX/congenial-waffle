import type { UserStats } from "@/types/user.types";

export const MOCK_USER_STATS: UserStats = {
  totalRides: 24,
  thisMonth: 6,
  totalSpent: 4200,
  rating: 4.8,
  ratingCount: 18,
  monthLabel: "May 2026",
};

export const MOCK_REFERRALS = [
  { name: "Amit Tiwari", status: "Completed first ride",      earned: "₹100",   color: "text-[var(--color-success)]"  },
  { name: "Sunita Nair", status: "Signed up, not ridden yet", earned: "Pending", color: "text-[var(--color-warning)]"  },
];

export const REFERRAL_CODE = "MOHAN100";
