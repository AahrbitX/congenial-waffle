"use client";

import { request } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

type Params = {
  date?: string;
};

// Hook to fetch the dashboard rides datatable data

export const useDashboardRides = (params?: Params) => {
  return useQuery({
    queryKey: ["dashboard", "rides", params],

    queryFn: () => {
      const qs = new URLSearchParams();

      if (params?.date) qs.set("date", params.date);

      return request<any>(
        `/api/reports/dashboard/rides${
          qs.toString() ? `?${qs.toString()}` : ""
        }`,
      );
    },

    refetchOnWindowFocus: false,
  });
};

type DashboardChartsResponse = {
  dailyRides: { date: string; day: string; bookings: number; completed: number }[];
  vehicleStats: { vehicle: string; bookings: number; completed: number }[];
  summary: {
    totalBookings: number;
    completed: number;
    pending: number;
    todayBookings: number;
    totalRevenue: string;
  };
};

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: () => request<DashboardChartsResponse>("/api/reports/dashboard/charts"),
    refetchOnWindowFocus: false,
    refetchInterval: 60_000, // refresh every minute
  });
};
