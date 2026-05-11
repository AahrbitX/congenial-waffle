import { Chip } from "@heroui/react";
import type { RideStatus } from "@/types/ride.types";

const STATUS_MAP: Record<RideStatus, { label: string; color: "success" | "danger" | "accent" | "warning" }> = {
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "danger"  },
  ongoing:   { label: "Ongoing",   color: "accent"  },
};

interface StatusBadgeProps {
  status: RideStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = STATUS_MAP[status] ?? { label: status, color: "warning" };
  return (
    <Chip color={color} variant="soft" size="sm" className="text-[11px] font-bold">
      {label}
    </Chip>
  );
}
