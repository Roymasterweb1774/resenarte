import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Muestra una valoración de 0 a 5 con relleno parcial. */
export function Stars({ value, size = 14, className }: { value: number | null; size?: number; className?: string }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (filled: boolean) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          strokeWidth={1.4}
          className={filled ? "fill-chocolate text-chocolate" : "text-line"}
        />
      ))}
    </div>
  );
  return (
    <div
      className={cn("relative inline-block", className)}
      role="img"
      aria-label={value == null ? "Sin valoraciones" : `${value.toFixed(1)} de 5 estrellas`}
    >
      {row(false)}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(true)}
      </div>
    </div>
  );
}
