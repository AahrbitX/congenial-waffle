"use client";

import { ArrowRight } from "lucide-react";

interface RouteCellProps {
  from: string;
  to: string;
}

function truncate(text: string, max = 24) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export function RouteCell({ from, to }: RouteCellProps) {
  return (
    <div
      className="flex items-center gap-2 min-w-[280px] max-w-[480px]"
      title={`${from} → ${to}`}
    >
      <p className="truncate text-sm font-medium flex-1 min-w-0">{truncate(from)}</p>
      <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
      <p className="truncate text-sm font-medium flex-1 min-w-0 text-right">{truncate(to)}</p>
    </div>
  );
}
