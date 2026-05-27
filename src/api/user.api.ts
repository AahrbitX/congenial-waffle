import { request } from "@/lib/api-client";
import { MOCK_REFERRALS } from "@/data/user.mock";
import { MOCK_FAQS } from "@/data/faqs.mock";
import type { UserStats, Faq } from "@/types/user.types";

type StatsResponse = {
  totalRides: number;
  thisMonth: number;
  totalSpent: number;
  rating: number;
  ratingCount: number;
  monthLabel: string;
};

export async function getUserStats(): Promise<UserStats> {
  const res = await request<StatsResponse>("/api/users/stats");
  return {
    totalRides: res.totalRides,
    thisMonth: res.thisMonth,
    totalSpent: res.totalSpent,
    rating: res.rating,
    ratingCount: res.ratingCount,
    monthLabel: res.monthLabel,
  };
}

export async function getFaqs(): Promise<Faq[]> {
  return MOCK_FAQS;
}

export async function getReferrals(): Promise<typeof MOCK_REFERRALS> {
  return MOCK_REFERRALS;
}
