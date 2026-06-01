"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card } from "@heroui/react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";
import { ResponsiveCard } from "../ui/ResponsiveCard";

const chartData = [
  { vehicle: "Sedan", bookings: 420, completed: 398 },
  { vehicle: "SUV", bookings: 310, completed: 287 },
  { vehicle: "Minivan", bookings: 180, completed: 171 },
  { vehicle: "Premium", bookings: 95, completed: 88 },
];
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

export function VehiclePerformanceChart() {
  const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);

  const totalCompleted = chartData.reduce(
    (sum, item) => sum + item.completed,
    0,
  );

  const completionRate = Math.round((totalCompleted / totalBookings) * 100);

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
              cursor={{
                fill: "var(--color-accent)",
                fillOpacity: 0.06,
              }}
              content={<ChartTooltipContent indicator="line" />}
            />

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

          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            {completionRate}%
            <TrendingUp size={16} />
          </div>
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}
