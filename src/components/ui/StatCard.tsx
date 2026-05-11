import { ElementType } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ElementType;
  colorClass: string;
}

export function StatCard({ label, value, sub, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[22px] font-black text-[var(--color-text-primary)] leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}
