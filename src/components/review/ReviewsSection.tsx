"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/Toast";
import { ReviewCard } from "./ReviewCard";

const SORTS = { recientes: "Más recientes", valoradas: "Mejor valoradas", utiles: "Más útiles" } as const;

export function ReviewsSection({
  reviews,
  slug,
  viewerId,
  isModerator,
  emptyAction,
}: {
  reviews: Review[];
  slug: string;
  viewerId: string | null;
  isModerator: boolean;
  emptyAction?: React.ReactNode;
}) {
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [rating, setRating] = useState<number | null>(null);
  const [sort, setSort] = useState<keyof typeof SORTS>("recientes");

  // Aviso tras publicar o actualizar una reseña
  useEffect(() => {
    const flag = params.get("resena");
    if (!flag) return;
    toast(flag === "actualizada" ? "Tu reseña se actualizó correctamente." : "¡Gracias! Tu reseña ya está publicada.");
    router.replace(`${pathname}#resenas`, { scroll: false });
  }, [params, pathname, router, toast]);

  const counts = useMemo(() => [5, 4, 3, 2, 1].map((n) => reviews.filter((r) => r.rating === n).length), [reviews]);

  const list = useMemo(() => {
    const filtered = rating ? reviews.filter((r) => r.rating === rating) : reviews;
    const sorted = [...filtered].sort((a, b) =>
      sort === "valoradas" ? b.rating - a.rating || b.created_at.localeCompare(a.created_at)
      : sort === "utiles" ? b.helpful_count - a.helpful_count
      : b.created_at.localeCompare(a.created_at),
    );
    // La reseña propia siempre arriba
    return sorted.sort((a, b) => Number(b.user_id === viewerId) - Number(a.user_id === viewerId));
  }, [reviews, rating, sort, viewerId]);

  if (!reviews.length) {
    return (
      <EmptyState
        title="Este perfume todavía no tiene reseñas"
        text="Las reseñas son escritas por personas reales de la comunidad. ¿Lo probaste? Contá tu experiencia."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow mb-3">Filtrar por calificación</p>
          <ul className="space-y-1">
            <li>
              <FilterBtn active={rating === null} onClick={() => setRating(null)} label="Todas" count={reviews.length} />
            </li>
            {[5, 4, 3, 2, 1].map((n, i) => (
              <li key={n}>
                <FilterBtn active={rating === n} onClick={() => setRating(rating === n ? null : n)} label={`${n} ${n === 1 ? "estrella" : "estrellas"}`} count={counts[i]} pct={counts[i] / reviews.length} />
              </li>
            ))}
          </ul>
          <label className="mt-6 block">
            <span className="eyebrow mb-2 block">Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="input !py-2.5 text-sm">
              {Object.entries(SORTS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <div>
        {list.length ? (
          <AnimatePresence initial={false}>
            {list.map((r) => (
              <ReviewCard key={r.id} review={r} slug={slug} viewerId={viewerId} isModerator={isModerator} />
            ))}
          </AnimatePresence>
        ) : (
          <p className="py-10 text-center text-sm text-muted">No hay reseñas con esa calificación.</p>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, label, count, pct }: { active: boolean; onClick: () => void; label: string; count: number; pct?: number }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn("relative flex w-full items-center justify-between overflow-hidden rounded-lg px-3 py-2 text-left text-sm transition-colors", active ? "bg-forest text-white" : "hover:bg-ivory")}
    >
      {pct !== undefined && !active && <span className="absolute inset-y-0 left-0 bg-sage-light/60" style={{ width: `${pct * 100}%` }} />}
      <span className="relative">{label}</span>
      <span className={cn("relative text-xs tabular-nums", active ? "text-white/80" : "text-muted")}>{count}</span>
    </button>
  );
}
