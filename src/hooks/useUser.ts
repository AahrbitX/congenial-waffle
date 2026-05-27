import { useQuery } from "@tanstack/react-query";
import { getUserStats, getFaqs, getReferrals, hasPassword } from "@/api/user.api";

export const USER_STATS_KEY  = ["userStats"] as const;
export const FAQS_KEY        = ["faqs"] as const;
export const REFERRALS_KEY   = ["referrals"] as const;
export const HAS_PASSWORD_KEY = ["hasPassword"] as const;

export function useUserStats() {
  return useQuery({ queryKey: USER_STATS_KEY, queryFn: getUserStats });
}

export function useFaqs() {
  return useQuery({ queryKey: FAQS_KEY, queryFn: getFaqs });
}

export function useReferrals() {
  return useQuery({ queryKey: REFERRALS_KEY, queryFn: getReferrals });
}

export function useHasPassword() {
  return useQuery({ queryKey: HAS_PASSWORD_KEY, queryFn: hasPassword });
}
