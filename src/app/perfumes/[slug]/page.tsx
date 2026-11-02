import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { AccordBars } from "@/components/perfume/AccordBars";
import { CommunityVotes } from "@/components/perfume/CommunityVotes";
import { NotesPyramid } from "@/components/perfume/NotesPyramid";
import { PerfumeActions } from "@/components/perfume/PerfumeActions";
import { DemoBadge, PerfumeCard } from "@/components/perfume/PerfumeCard";
import { PerfumeGallery } from "@/components/perfume/PerfumeGallery";
import { ReviewsSection } from "@/components/review/ReviewsSection";
import { Stars } from "@/components/ui/Stars";
import { GENDERS, NO_INFO, SITE } from "@/lib/constants";
import {
  getAllPerfumes,
  getCurrentUser,
  getPerfumeBySlug,
  getPerfumeShelfState,
  getReviewsForPerfume,
  getSimilar,
  getVoteStats,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatRating, plural } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPerfumeBySlug(slug);
  if (!p) return { title: "Perfume no encontrado" };
  const desc =
    p.description ??
    `${p.name} de ${p.brand.name}: notas, acordes y reseñas de la comunidad en Reseñarte.`;
  return {
    title: `${p.name} de ${p.brand.name}`,
    description: desc,
    alternates: { canonical: `/perfumes/${p.slug}` },
    openGraph: { title: `${p.name} — ${p.brand.name}`, description: desc, images: p.image_url ? [p.image_url] : undefined },
  };
}

export default async function PerfumePage({ params }: Props) {
  const { slug } = await params;
  const perfume = await getPerfumeBySlug(slug);
  if (!perfume) notFound();

  const user = await getCurrentUser();
  const [all, reviews, votes, shelf] = await Promise.all([
    getAllPerfumes(),
    getReviewsForPerfume(perfume.id, user?.id),
    getVoteStats(perfume.id, user?.id),
    getPerfumeShelfState(perfume.id, user?.id),
  ]);
  const similar = getSimilar(perfume, all);
  const hasOwnReview = !!user && reviews.some((r) => r.user_id === user.id);
  const isModerator = ["admin", "moderator"].includes(user?.profile?.role ?? "");

  const facts = [
    ["Concentración", perfume.concentration],
    ["Lanzamiento", perfume.release_year?.toString()],
    ["Familia olfativa", perfume.family?.name],
    ["Género comercial", perfume.gender ? GENDERS[perfume.gender] : null],
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: perfume.name,
    brand: { "@type": "Brand", name: perfume.brand.name },
    category: "Perfume",
    url: `${SITE.url}/perfumes/${perfume.slug}`,
    ...(perfume.image_url && { image: perfume.image_url }),
    ...(perfume.description && { description: perfume.description }),
    ...(perfume.review_count > 0 &&
      perfume.rating_avg != null && {
        aggregateRating: { "@type": "AggregateRating", ratingValue: perfume.rating_avg, reviewCount: perfume.review_count, bestRating: 5, worstRating: 1 },
      }),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-editorial pt-4">
        <nav aria-label="Ruta de navegación" className="mb-8 text-xs text-muted">
          <Link href="/perfumes" className="hover:text-forest">Perfumes</Link>
          <span className="mx-2">/</span>
          <Link href={`/marcas/${perfume.brand.slug}`} className="hover:text-forest">{perfume.brand.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{perfume.name}</span>
        </nav>

        {/* Cabecera */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <PerfumeGallery perfume={perfume} />
          </div>

          <div className="lg:pt-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <Link href={`/marcas/${perfume.brand.slug}`} className="eyebrow link-underline">{perfume.brand.name}</Link>
                {perfume.is_demo && <DemoBadge />}
              </div>
              <h1 className="mt-4 text-6xl leading-[0.95] sm:text-7xl">{perfume.name}</h1>
            </Reveal>

            <Reveal delay={0.1}>
              <a href="#resenas" className="mt-8 flex items-center gap-5 rounded-2xl border border-line p-5 transition-colors hover:border-sage">
                <span className="font-serif text-6xl leading-none text-forest">{formatRating(perfume.rating_avg)}</span>
                <span>
                  <Stars value={perfume.rating_avg} size={18} />
                  <span className="mt-1.5 block text-sm text-muted">
                    {perfume.review_count ? `Valoración media de ${plural(perfume.review_count, "reseña", "reseñas")}` : "Todavía sin reseñas"}
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.15}>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow !text-muted">{k}</dt>
                    <dd className={v ? "mt-1 font-serif text-xl" : "mt-1 text-sm text-muted italic"}>{v ?? NO_INFO}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-8 text-[1.05rem] leading-relaxed text-ink/80">{perfume.description ?? <span className="text-muted italic">{NO_INFO}</span>}</p>
              {perfume.accords.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {perfume.accords.slice(0, 6).map((a) => (
                    <span key={a.accord.id} className="tag">
                      <span className="size-2 rounded-full" style={{ backgroundColor: a.accord.color ?? "#8A9B7A" }} /> {a.accord.name}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>

            <Reveal delay={0.25} className="mt-10">
              {isSupabaseConfigured() ? (
                <PerfumeActions
                  perfumeId={perfume.id}
                  slug={perfume.slug}
                  loggedIn={!!user}
                  hasOwnReview={hasOwnReview}
                  initialFavorite={shelf.favorite}
                  initialStatus={shelf.status}
                />
              ) : (
                <p className="rounded-xl bg-ivory p-4 text-sm text-chocolate">
                  Reseñas, favoritos y colección se activan al conectar la base de datos (modo demostración).
                </p>
              )}
            </Reveal>
          </div>
        </div>

        {/* Pirámide y acordes */}
        <section className="mt-28 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">Composición</p>
              <h2 className="mt-2 mb-8 text-5xl">Pirámide olfativa</h2>
            </Reveal>
            <NotesPyramid notes={perfume.notes} />
          </div>
          <div>
            <Reveal>
              <p className="eyebrow">Carácter</p>
              <h2 className="mt-2 mb-8 text-5xl">Acordes principales</h2>
            </Reveal>
            <AccordBars accords={perfume.accords} />
            {perfume.accords.length > 0 && <p className="mt-4 text-xs text-muted">Acordes registrados por el equipo editorial a partir de información verificada.</p>}
          </div>
        </section>

        {/* Votos */}
        <section id="comunidad" className="mt-28">
          <Reveal>
            <p className="eyebrow">Cómo lo vive la comunidad</p>
            <h2 className="mt-2 mb-8 text-5xl">Valoraciones de la comunidad</h2>
          </Reveal>
          <CommunityVotes perfumeId={perfume.id} slug={perfume.slug} stats={votes.stats} mine={votes.mine} loggedIn={!!user} />
        </section>

        {/* Reseñas */}
        <section id="resenas" className="mt-28">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Opiniones reales</p>
              <h2 className="mt-2 text-5xl">Reseñas {reviews.length > 0 && <span className="text-muted">({reviews.length})</span>}</h2>
            </div>
            {user && (
              <Link href={`/perfumes/${perfume.slug}/resena`} className="btn btn-primary">
                {hasOwnReview ? "Editar mi reseña" : "Escribir reseña"}
              </Link>
            )}
          </Reveal>
          <Suspense>
            <ReviewsSection
              reviews={reviews}
              slug={perfume.slug}
              viewerId={user?.id ?? null}
              isModerator={isModerator}
              emptyAction={
                isSupabaseConfigured() ? (
                  <Link href={user ? `/perfumes/${perfume.slug}/resena` : `/ingresar?next=/perfumes/${perfume.slug}/resena`} className="btn btn-primary">
                    Escribir la primera reseña
                  </Link>
                ) : undefined
              }
            />
          </Suspense>
        </section>

        {/* Similares */}
        {similar.length > 0 && (
          <section className="mt-28">
            <Reveal>
              <p className="eyebrow">Por notas, acordes y familia</p>
              <h2 className="mt-2 mb-10 text-5xl">Perfumes similares</h2>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {similar.map((p) => (
                <StaggerItem key={p.id}>
                  <PerfumeCard perfume={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>
    </article>
  );
}
