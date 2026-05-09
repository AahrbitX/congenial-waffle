"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";
import { Card } from "@heroui/react";

export const description = "A bar chart with a custom label";

const chartData = [
  { month: "Sedan", desktop: 126, mobile: 80 },
  { month: "SUV", desktop: 205, mobile: 200 },
  { month: "Minivan", desktop: 37, mobile: 120 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function BarChartHorizontal() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Vehicle wise booking/revenue</Card.Title>
        <Card.Description>January - June 2024</Card.Description>
      </Card.Header>
      <>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="desktop" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="desktop" fill="var(--color-accent)" radius={4}>
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-(--color-accent-foreground)"
                fontSize={16}
              />
              <LabelList
                dataKey="desktop"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={16}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </>
      {/* <Card.Footer className="flex-col items-start gap-2 text-sm"></Card.Footer> */}
    </Card>
  );
}
