"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import { Card } from "@heroui/react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";
import { ResponsiveCard } from "../ui/ResponsiveCard";

const chartData = [
  { day: "Mon", bookings: 145, completed: 92 },
  { day: "Tue", bookings: 162, completed: 81 },
  { day: "Wed", bookings: 178, completed: 121 },
  { day: "Thu", bookings: 201, completed: 110 },
  { day: "Fri", bookings: 234, completed: 85 },
  { day: "Sat", bookings: 280, completed: 93 },
  { day: "Sun", bookings: 248, completed: 170 },
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

export function BookingPerformanceChart() {
  const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);

  const totalCompleted = chartData.reduce(
    (sum, item) => sum + item.completed,
    0,
  );

  const completionRate = Math.round((totalCompleted / totalBookings) * 100);

  return (
    <ResponsiveCard>
      <Card.Header>
        <div>
          <Card.Title>Booking Performance</Card.Title>

          <Card.Description>
            Bookings vs completed rides in the last 7 days
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                left: 6,
                right: 6,
                top: 8,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.2}
              />

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

          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            {completionRate}%
            <TrendingUp size={16} />
          </div>
        </div>
      </Card.Footer>
    </ResponsiveCard>
  );
}
