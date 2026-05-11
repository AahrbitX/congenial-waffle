import { IconCar, IconNavigation } from "@/constants/icons";

interface MapPlaceholderProps {
  height?: number;
}

export function MapPlaceholder({ height = 140 }: MapPlaceholderProps) {
  return (
    <div
      className="w-full rounded-xl bg-gradient-to-br from-green-100 to-blue-100 border border-[var(--color-border)] flex items-center justify-center relative overflow-hidden"
      style={{ height }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
      >
        <path
          d="M10 40 C 25 30 40 22 55 18 C 70 14 80 10 90 8"
          stroke="var(--color-primary)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 2"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute left-[9%] top-[72%] w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white shadow" />
      <div className="absolute left-[86%] top-[12%] w-3 h-3 rounded bg-[var(--color-text-primary)] border-2 border-white shadow" />
      <div className="absolute left-[48%] top-[32%] w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
        <IconCar size={14} className="text-[var(--color-primary)]" />
      </div>
      <IconNavigation size={18} className="text-[var(--color-primary)] opacity-30" />
    </div>
  );
}
