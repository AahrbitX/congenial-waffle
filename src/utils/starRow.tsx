import { Star } from "lucide-react";

export function StarRow({
  rating,
  size = 13,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating ? "fill-orange-400 text-orange-400" : "text-muted"
          }
        />
      ))}
    </div>
  );
}
