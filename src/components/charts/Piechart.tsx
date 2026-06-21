"use client";

import { Pie, PieChart } from "recharts";

import { Card } from "@heroui/react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from ".";

const chartData = [
  {
    name: "Completed",
    value: 124,
    fill: "var(--color-green-500)",
  },

  {
    name: "Pending",
    value: 32,
    fill: "var(--color-yellow-500)",
  },

  {
    name: "On Trip",
    value: 18,
    fill: "var(--color-accent)",
  },

  {
    name: "Cancelled",
    value: 11,
    fill: "var(--color-red-500)",
  },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--color-green-500)",
  },

  pending: {
    label: "Pending",
    color: "var(--color-yellow-500)",
  },

  onTrip: {
    label: "On Trip",
    color: "var(--color-accent)",
  },

  cancelled: {
    label: "Cancelled",
    color: "var(--color-red-500)",
  },
} satisfies ChartConfig;

export function PieChartComponent() {
  return (
    <Card className="flex flex-col">
      <Card.Header>
        <Card.Title>Ride Status Distribution</Card.Title>
        <Card.Description>Current ride status breakdown</Card.Description>
      </Card.Header>

      <Card.Content className="flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-h-[206px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Pie
              data={chartData}
              innerRadius="10%"
              outerRadius="100%"
              cornerRadius={8}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive
            />
          </PieChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
