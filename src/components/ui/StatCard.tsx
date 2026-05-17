import { Card } from "@heroui/react";
import { ElementType } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ElementType;
  colorClass: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
}: StatCardProps) {
  return (
    <Card className="rounded-2xl flex items-start gap-4 flex-row">
      <div
        className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-muted ">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-sm text-muted mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}
