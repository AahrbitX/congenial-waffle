"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { Description, Surface } from "@heroui/react";

import { PieChartComponent } from "@/components/charts/Piechart";
import { LineChartComponent } from "@/components/charts/LineChart";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizondal";
import { RidesTable } from "./components/ridesTable";
import { useDashboardCharts } from "@/hooks/dashboard";

function AdminPage() {
  const { data: authData } = authClient.useSession();
  const { data: chartsData } = useDashboardCharts();

  // console.log(chartsData);

  return (
    <Surface className="h-full min-h-0 p-4" variant="secondary">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome Back, {authData?.user.name || "Admin"}
        </h1>
        <Description>
          Here&apos;s what&apos;s happening with Mohan Cabs today.
        </Description>
      </div>
      <div className="my-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_0.8fr] gap-4">
        <LineChartComponent />
        <BarChartHorizontal />
        <PieChartComponent />
      </div>
      <div>
        <RidesTable />
      </div>
    </Surface>
  );
}

export default AdminPage;
