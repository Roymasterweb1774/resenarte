import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { DemoBadge, PerfumeCard } from "@/components/perfume/PerfumeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { NO_INFO } from "@/lib/constants";
import { getBrandBySlug } from "@/lib/data";
import { plural } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBrandBySlug((await params).slug);
  if (!data) return { title: "Marca no encontrada" };
  return {
    title: data.brand.name,
    description: data.brand.description ?? `Perfumes de ${data.brand.name} en Reseñarte.`,
    alternates: { canonical: `/marcas/${data.brand.slug}` },
  };
}

export default async function BrandPage({ params }: Props) {
  const data = await getBrandBySlug((await params).slug);
  if (!data) notFound();
  const { brand, perfumes } = data;

  return (
    <div className="container-editorial pt-6">
      <Link href="/marcas" className="text-xs text-muted hover:text-forest">← Todas las marcas</Link>
      <Reveal className="grid gap-10 border-b border-line py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="eyebrow">Marca</p>
            {brand.is_demo && <DemoBadge />}
          </div>
          <h1 className="mt-3 text-6xl leading-none sm:text-7xl">{brand.name}</h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink/80">
            {brand.description ?? <span className="text-muted italic">{NO_INFO}</span>}
          </p>
          {brand.country && <p className="mt-3 text-sm text-muted">Origen: {brand.country}</p>}
        </div>
        {brand.logo_url && (
          <figure>
            <Image src={brand.logo_url} alt={`Logotipo de ${brand.name}`} width={180} height={180} className="size-40 rounded-2xl border border-line bg-white object-contain p-4" />
            {brand.logo_credit && <figcaption className="mt-1 text-xs text-muted">{brand.logo_credit}</figcaption>}
          </figure>
        )}
      </Reveal>

      <p className="mt-10 mb-8 text-sm text-muted">{plural(perfumes.length, "perfume", "perfumes")}</p>
      {perfumes.length ? (
        <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {perfumes.map((p) => (
            <StaggerItem key={p.id}>
              <PerfumeCard perfume={p} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState title="Sin perfumes por ahora" text="Esta marca todavía no tiene perfumes cargados en el catálogo." />
      )}
    </div>
  );
}
