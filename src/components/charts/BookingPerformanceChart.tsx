"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { Card, Skeleton } from "@heroui/react";
import {
  ChartContainer,
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

type DayData = {
  day: string;
  bookings: number;
  completed: number;
};

function ChartSkeleton() {
  return (
    <ResponsiveCard>
      <Card.Header>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </div>
      </Card.Header>
      <Card.Content>
        <div className="h-[200px] flex items-end gap-2 px-2">
          {[60, 80, 55, 90, 70, 95, 75].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Card.Content>
      <Card.Footer>
        <div className="flex w-full items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
          <Skeleton className="h-5 w-14 rounded" />
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}

interface BookingPerformanceChartProps {
  data?: DayData[];
  isLoading?: boolean;
}

export function BookingPerformanceChart({ data, isLoading }: BookingPerformanceChartProps) {
  if (isLoading) return <ChartSkeleton />;

  const chartData = data ?? [];
  const totalBookings  = chartData.reduce((s, d) => s + d.bookings,  0);
  const totalCompleted = chartData.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalBookings > 0
    ? Math.round((totalCompleted / totalBookings) * 100)
    : 0;

  const trending = completionRate >= 70;

  return (
    <ResponsiveCard>
      <Card.Header>
        <div>
          <Card.Title>Booking Performance</Card.Title>
          <Card.Description>Bookings vs completed rides in the last 7 days</Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ left: 6, right: 6, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="var(--color-accent)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-success)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card.Content>

      <Card.Footer>
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Completion Rate</p>
            <p className="text-xs text-muted">Last 7 days performance</p>
          </div>
          <div className={`flex items-center gap-2 text-sm font-semibold ${trending ? "text-success" : "text-warning"}`}>
            {completionRate}%
            {trending ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}
