"use client";

import React from "react";
import clsx from "clsx";
import { Surface } from "@heroui/react";

type SummaryValue = string | number | boolean | null | undefined;

type SummaryData = Record<string, SummaryValue>;

interface SummaryProps {
  data: SummaryData;
  size?: "base" | "sm" | "compact";
  className?: string;
}

const sizeStyles = {
  base: {
    wrapper: "p-4 gap-3",
    grid: "gap-3",
    key: "text-sm text-muted",
    value: "text-base font-medium mt-1",
  },
  sm: {
    wrapper: "p-3 gap-2",
    grid: "gap-2",
    key: "text-xs text-muted",
    value: "text-sm font-medium mt-1",
  },
  compact: {
    wrapper: "p-2 gap-2",
    grid: "gap-2 p-2",
    key: "text-[12px] text-muted",
    value: "text-xs font-medium mt-0.5",
  },
};

const formatLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value: SummaryValue) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

function Summary(props: SummaryProps) {
  const { data, size = "base", className } = props;

  const styles = sizeStyles[size];

  return (
    <Surface
      variant="tertiary"
      className={clsx("w-full rounded-2xl", styles.wrapper, className)}
    >
      <div className={clsx("grid grid-cols-2", styles.grid)}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <p className={styles.key}>{formatLabel(key)}</p>

            <p className={styles.value}>{formatValue(value)}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export default Summary;
