"use client";

import { request } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

type Params = {
  date?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

// Hook to fetch the dashboard rides datatable data

export const useDashboardRides = (params?: Params) => {
  return useQuery({
    queryKey: ["dashboard", "rides", params],

    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.date) qs.set("date", params.date);
      if (params?.search) qs.set("search", params.search);
      if (params?.status) qs.set("status", params.status);
      if (params?.page) qs.set("page", String(params.page));
      if (params?.pageSize) qs.set("pageSize", String(params.pageSize));

      return request<any>(
        `/api/reports/dashboard/rides${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
    },

    refetchOnWindowFocus: false,
  });
};

type DashboardChartsResponse = {
  dailyRides: {
    date: string;
    day: string;
    bookings: number;
    completed: number;
  }[];
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
    queryFn: () =>
      request<DashboardChartsResponse>("/api/reports/dashboard/charts"),
    refetchOnWindowFocus: false,
    refetchInterval: 60_000, // refresh every minute
  });
};
