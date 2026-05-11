import { MOCK_USER_STATS, MOCK_REFERRALS } from "@/data/user.mock";
import { MOCK_FAQS } from "@/data/faqs.mock";
import type { UserStats, Faq } from "@/types/user.types";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

export async function getUserStats(): Promise<UserStats> {
  await delay();
  return MOCK_USER_STATS;
}

export async function getFaqs(): Promise<Faq[]> {
  await delay(300);
  return MOCK_FAQS;
}

export async function getReferrals(): Promise<typeof MOCK_REFERRALS> {
  await delay(300);
  return MOCK_REFERRALS;
}
