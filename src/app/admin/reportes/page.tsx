import Link from "next/link";
import { moderateReview, resolveReport } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/AdminControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { getHiddenReviews, getReports } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminReports() {
  const [reports, hidden] = await Promise.all([getReports("open"), getHiddenReviews()]);

  return (
    <div className="space-y-16">
      <section>
        <h1 className="text-5xl">Reseñas reportadas</h1>
        <p className="mt-2 mb-8 text-sm text-muted">Ocultá el contenido inapropiado o descartá el reporte si la reseña cumple las normas.</p>
        {reports.length ? (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line p-5">
                <p className="text-xs text-muted">
                  Reportado por @{r.reporter?.username} el {formatDate(r.created_at)}
                </p>
                <p className="mt-1 text-sm">
                  <strong>Motivo:</strong> {r.reason}
                </p>
                {r.review && (
                  <div className="mt-4 rounded-xl bg-ivory p-4">
                    <p className="text-xs text-muted">
                      @{r.review.author?.username} sobre{" "}
                      <Link href={`/perfumes/${r.review.perfume?.slug}`} className="underline">{r.review.perfume?.name}</Link> · {r.review.rating}★ ·{" "}
                      {r.review.status === "hidden" ? "oculta" : "publicada"}
                    </p>
                    <p className="mt-2 font-serif text-xl">{r.review.title}</p>
                    <p className="mt-1 line-clamp-4 text-sm text-ink/75">{r.review.body}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.review && r.review.status !== "hidden" && (
                    <ActionButton action={moderateReview.bind(null, r.review.id, "hidden", r.reason)} label="Ocultar reseña" tone="danger" />
                  )}
                  <ActionButton action={resolveReport.bind(null, r.id, "dismissed")} label="Descartar reporte" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Sin reportes abiertos" text="La comunidad está en calma." />
        )}
      </section>

      <section>
        <h2 className="mb-6 text-3xl">Reseñas ocultas</h2>
        {hidden.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {hidden.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-serif text-lg">{r.title}</p>
                  <p className="text-xs text-muted">
                    @{r.author?.username} · {r.perfume?.name}
                  </p>
                </div>
                <ActionButton action={moderateReview.bind(null, r.id, "published", undefined)} label="Restaurar" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No hay reseñas ocultas.</p>
        )}
      </section>
    </div>
  );
}
