import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PerfumeCard } from "@/components/perfume/PerfumeCard";
import { SearchBox } from "@/components/search/SearchBox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { filterCatalog, type CatalogParams } from "@/lib/catalog";
import { getAllPerfumes, getFamilies } from "@/lib/data";
import { plural } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explorar perfumes",
  description: "Catálogo de perfumes con notas, acordes y valoraciones de la comunidad. Filtrá por marca, familia, notas y más.",
  alternates: { canonical: "/perfumes" },
};

export default async function PerfumesPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  const [perfumes, families] = await Promise.all([getAllPerfumes(), getFamilies()]);
  const { results, total, page, pages, fuzzyOnly } = filterCatalog(perfumes, params);

  const brands = [...new Map(perfumes.map((p) => [p.brand.slug, p.brand.name])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
  const notes = [...new Map(perfumes.flatMap((p) => p.notes.map((n) => [n.note.slug, n.note.name] as [string, string]))).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  const activeFamily = families.find((f) => f.slug === params.familia);
  const activeNote = notes.find((n) => n.value === params.nota);

  return (
    <div className="container-editorial pt-8">
      <header className="mx-auto max-w-3xl pb-14 text-center">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          {activeFamily ? (
            <>Perfumes <em className="text-forest">{activeFamily.name.toLowerCase()}</em></>
          ) : activeNote ? (
            <>Perfumes con <em className="text-forest">{activeNote.label.toLowerCase()}</em></>
          ) : (
            <>Explorar <em className="text-forest">perfumes</em></>
          )}
        </h1>
        {activeFamily?.description && <p className="mx-auto mt-4 max-w-xl text-muted">{activeFamily.description}</p>}
        <div className="mx-auto mt-8 max-w-xl">
          <SearchBox size="compact" defaultValue={params.q ?? ""} key={params.q ?? ""} />
        </div>
      </header>

      <Suspense>
        <CatalogFilters
          brands={brands}
          families={families.map((f) => ({ value: f.slug, label: f.name }))}
          notes={notes}
          hasQuery={!!params.q}
        >
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {params.q ? (
              <>
                {plural(total, "resultado", "resultados")} para <strong className="text-ink">“{params.q}”</strong>
                {fuzzyOnly && results[0] && (
                  <span className="block pt-1 text-chocolate">
                    No encontramos coincidencias exactas. ¿Quisiste decir{" "}
                    <Link href={`/perfumes?q=${encodeURIComponent(results[0].name)}`} className="underline">
                      {results[0].name}
                    </Link>
                    ?
                  </span>
                )}
              </>
            ) : (
              plural(total, "perfume", "perfumes")
            )}
          </p>

          {results.length ? (
            <Stagger key={JSON.stringify(params)} className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3" gap={0.05}>
              {results.map((p) => (
                <StaggerItem key={p.id}>
                  <PerfumeCard perfume={p} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <EmptyState
              title="No encontramos perfumes"
              text="Probá con otra palabra, revisá la ortografía o quitá algunos filtros."
              action={<Link href="/perfumes" className="btn btn-outline">Ver todo el catálogo</Link>}
            />
          )}

          <Pagination page={page} pages={pages} basePath="/perfumes" params={{ ...params }} />
        </CatalogFilters>
      </Suspense>
    </div>
  );
}
