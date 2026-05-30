"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";

import { BookingPerformanceChart } from "@/components/charts/BookingPerformanceChart";
import { VehiclePerformanceChart } from "@/components/charts/VehiclePerformanceChart";

import { RidesTable } from "./components/ridesTable";
import { useDashboardCharts } from "@/hooks/dashboard";
import { ResponsiveSurface } from "@/components/ui/ResponsiveSurface";

function AdminPage() {
  const { data: authData } = authClient.useSession();
  const { data: chartsData } = useDashboardCharts();

  // console.log(chartsData);

  return (
    <ResponsiveSurface className="min-h-full py-4" variant="secondary">
      <div className="px-4 md:px-0">
        <h1 className="text-xl font-semibold">
          Welcome Back, {authData?.user.name || "Admin"}
        </h1>
        <p className="text-sm text-muted">
          Here&apos;s what&apos;s happening with Mohan Cabs today.
        </p>
      </div>
      <div className="my-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
        <BookingPerformanceChart />
        <VehiclePerformanceChart />
        {/* <PieChartComponent /> */}
      </div>
      <div>
        <RidesTable />
      </div>
    </ResponsiveSurface>
  );
}

export default AdminPage;
