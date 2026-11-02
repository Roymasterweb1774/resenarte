import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBrands } from "@/lib/data";
import { normalize, plural } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marcas",
  description: "Índice alfabético de marcas de perfumes y sus fragancias.",
  alternates: { canonical: "/marcas" },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const groups = new Map<string, typeof brands>();
  for (const b of brands) {
    const letter = /[a-z]/.test(normalize(b.name)[0] ?? "") ? normalize(b.name)[0].toUpperCase() : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), b]);
  }
  const letters = [...groups.keys()].sort();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="container-editorial pt-8">
      <Reveal className="mx-auto max-w-3xl pb-12 text-center">
        <p className="eyebrow">Índice</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          Las <em className="text-forest">marcas</em>
        </h1>
        <p className="mt-4 text-muted">{plural(brands.length, "marca", "marcas")} en el catálogo.</p>
      </Reveal>

      <nav aria-label="Letras" className="sticky top-[68px] z-20 -mx-5 mb-12 overflow-x-auto border-y border-line bg-white/95 px-5 py-3 backdrop-blur">
        <ul className="flex min-w-max justify-center gap-1">
          {alphabet.map((l) => (
            <li key={l}>
              {groups.has(l) ? (
                <a href={`#letra-${l}`} className="grid size-8 place-items-center rounded-full font-serif text-lg text-forest hover:bg-ivory">{l}</a>
              ) : (
                <span className="grid size-8 place-items-center font-serif text-lg text-line">{l}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {brands.length === 0 ? (
        <EmptyState title="Aún no hay marcas" text="El equipo editorial las irá incorporando desde el panel de administración." />
      ) : (
        <div className="space-y-14">
          {letters.map((l) => (
            <section key={l} id={`letra-${l}`} className="grid gap-6 border-t border-line pt-8 md:grid-cols-[120px_1fr]">
              <h2 className="font-serif text-7xl leading-none text-sage italic">{l}</h2>
              <Stagger className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3" gap={0.04}>
                {groups.get(l)!.map((b) => (
                  <StaggerItem key={b.id}>
                    <Link href={`/marcas/${b.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-line/60 py-3">
                      <span className="font-serif text-2xl transition-colors group-hover:text-forest">
                        {b.name}
                        {b.is_demo && <span className="ml-2 align-middle font-sans text-[10px] tracking-widest text-chocolate uppercase">demo</span>}
                      </span>
                      <span className="text-xs text-muted">{b.perfume_count}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
