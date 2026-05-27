export interface DashboardUser {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface UserStats {
  totalRides: number;
  thisMonth: number;
  totalSpent: number;
  rating: number;
  ratingCount: number;
  monthLabel: string;
}

export interface Faq {
  q: string;
  a: string;
}
