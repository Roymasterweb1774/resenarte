import Link from "next/link";
import type { Perfume } from "@/lib/types";
import { formatRating, plural } from "@/lib/utils";
import { Stars } from "../ui/Stars";
import { PerfumeVisual } from "./PerfumeVisual";

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Contenido ficticio de demostración"
      className={`rounded-full border border-chocolate/30 bg-white/80 px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] text-chocolate uppercase backdrop-blur ${className}`}
    >
      Demo
    </span>
  );
}

export function PerfumeCard({ perfume, extra }: { perfume: Perfume; extra?: React.ReactNode }) {
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/perfumes/${perfume.slug}`} className="flex h-full flex-col" aria-label={`${perfume.name} de ${perfume.brand.name}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line/70 transition-[border-color,box-shadow] duration-500 group-hover:border-sage/60 group-hover:shadow-[0_24px_48px_-28px_rgba(52,75,56,0.45)]">
          <PerfumeVisual
            perfume={perfume}
            className="h-full w-full"
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.05]"
          />
          {perfume.is_demo && <DemoBadge className="absolute top-3 left-3" />}
          <span className="absolute right-3 bottom-3 translate-y-2 rounded-full bg-white/90 px-3 py-1 text-xs text-forest opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Ver ficha →
          </span>
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <p className="eyebrow">{perfume.brand.name}</p>
          <h3 className="mt-1 text-[1.45rem] leading-tight transition-colors group-hover:text-forest">{perfume.name}</h3>
          {perfume.family && <p className="mt-1 text-xs text-muted">{perfume.family.name}</p>}
          <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted">
            <Stars value={perfume.rating_avg} size={12} />
            {perfume.review_count > 0 ? (
              <span>
                <strong className="font-medium text-ink">{formatRating(perfume.rating_avg)}</strong> ·{" "}
                {plural(perfume.review_count, "reseña", "reseñas")}
              </span>
            ) : (
              <span>Sin reseñas aún</span>
            )}
          </div>
        </div>
      </Link>
      {extra}
    </article>
  );
}

export function PerfumeCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5]" />
      <div className="skeleton mt-4 h-3 w-1/3" />
      <div className="skeleton mt-2 h-6 w-2/3" />
      <div className="skeleton mt-3 h-3 w-1/2" />
    </div>
  );
}
