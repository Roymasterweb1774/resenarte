import Link from "next/link";
import { deletePerfume } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/AdminControls";
import { DemoBadge } from "@/components/perfume/PerfumeCard";
import { PerfumeVisual } from "@/components/perfume/PerfumeVisual";
import { getAllPerfumes } from "@/lib/data";
import { formatRating } from "@/lib/utils";

export default async function AdminPerfumes({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const { guardado } = await searchParams;
  const perfumes = await getAllPerfumes();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl">Perfumes</h1>
        <Link href="/admin/perfumes/nuevo" className="btn btn-primary">Añadir perfume</Link>
      </div>
      {guardado && (
        <p className="mt-6 rounded-xl bg-sage-light px-4 py-3 text-sm text-forest-dark">
          Perfume guardado. <Link href={`/perfumes/${guardado}`} className="underline">Ver ficha</Link>
        </p>
      )}
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {perfumes.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 py-3">
            <PerfumeVisual perfume={p} className="size-14 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{p.brand.name}</p>
              <p className="font-serif text-xl">
                {p.name} {p.is_demo && <DemoBadge className="ml-1 align-middle" />}
              </p>
            </div>
            <p className="text-xs text-muted">
              {formatRating(p.rating_avg)} · {p.review_count} reseñas
            </p>
            <div className="flex gap-2">
              <Link href={`/admin/perfumes/${p.id}`} className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-forest hover:text-forest">Editar</Link>
              <ActionButton
                action={deletePerfume.bind(null, p.id)}
                label="Eliminar"
                tone="danger"
                confirm={`¿Eliminar “${p.name}”? También se borrarán sus reseñas y votos.`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
