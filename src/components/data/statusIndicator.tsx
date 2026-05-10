"use client";

import React from "react";
import { cn } from "@heroui/react";

type Status = "pending" | "completed" | "cancelled" | "confirmed";

const statusStyles: Record<Status, { dot: string; text: string }> = {
  pending: {
    dot: "bg-yellow-400",
    text: "text-yellow-600",
  },
  completed: {
    dot: "bg-green-500",
    text: "text-green-600",
  },
  confirmed: {
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  cancelled: {
    dot: "bg-red-500",
    text: "text-red-600",
  },
};

function StatusIndicator({ status }: { status: Status }) {
  const styles = statusStyles[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 rounded-full inline-block", styles.dot)}
      />
      <span className={cn("text-sm font-medium capitalize", styles.text)}>
        {status}
      </span>
    </div>
  );
}

export default StatusIndicator;
