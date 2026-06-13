"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, Skeleton } from "@heroui/react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";
import { ResponsiveCard } from "../ui/ResponsiveCard";

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "var(--color-accent)",
  },
  completed: {
    label: "Completed",
    color: "var(--color-success)",
  },
} satisfies ChartConfig;

type VehicleData = {
  vehicle: string;
  bookings: number;
  completed: number;
};

function ChartSkeleton() {
  return (
    <ResponsiveCard>
      <Card.Header>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </div>
      </Card.Header>
      <Card.Content>
        <div className="h-full flex items-end gap-2 px-2">
          {[69, 85, 50, 90, 67, 92, 44].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </Card.Content>
      <Card.Footer>
        <div className="flex w-full items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
          <Skeleton className="h-5 w-14 rounded" />
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}

interface VehiclePerformanceChartProps {
  data?: VehicleData[];
  isLoading?: boolean;
}

export function VehiclePerformanceChart({
  data,
  isLoading,
}: VehiclePerformanceChartProps) {
  if (isLoading) return <ChartSkeleton />;

  // Capitalise vehicle label for display
  const chartData = (data ?? []).map((v) => ({
    ...v,
    vehicle: v.vehicle.charAt(0).toUpperCase() + v.vehicle.slice(1),
  }));

  const totalBookings = chartData.reduce((s, d) => s + d.bookings, 0);
  const totalCompleted = chartData.reduce((s, d) => s + d.completed, 0);
  const completionRate =
    totalBookings > 0 ? Math.round((totalCompleted / totalBookings) * 100) : 0;

  const trending = completionRate >= 70;

  return (
    <ResponsiveCard>
      <Card.Header>
        <Card.Title>Vehicle Performance</Card.Title>
        <Card.Description>
          Bookings and completed rides by vehicle category
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} opacity={0.2} />
            <XAxis
              dataKey="vehicle"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-accent)", fillOpacity: 0.06 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="bookings"
              fill="var(--color-bookings)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </Card.Content>

      <Card.Footer>
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Fleet Completion Rate</p>
            <p className="text-xs text-muted">Across all vehicle categories</p>
          </div>
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${trending ? "text-success" : "text-warning"}`}
          >
            {completionRate}%
            {trending ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}
