import { ArrowRight, BookmarkPlus, PenLine, UserPlus } from "lucide-react";
import Link from "next/link";
import { FamilyGrid } from "@/components/home/FamilyGrid";
import { Hero } from "@/components/home/Hero";
import { NotesMarquee } from "@/components/home/NotesMarquee";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { PerfumeCard } from "@/components/perfume/PerfumeCard";
import { ReviewSnippet } from "@/components/review/ReviewSnippet";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllPerfumes, getCurrentUser, getFamilies, getLatestReviews, getTrending } from "@/lib/data";
import type { Note } from "@/lib/types";
import { plural } from "@/lib/utils";

export default async function HomePage() {
  const [perfumes, families, latest, trending, user] = await Promise.all([
    getAllPerfumes(),
    getFamilies(),
    getLatestReviews(3),
    getTrending(4),
    getCurrentUser(),
  ]);

  const mostReviewed = [...perfumes]
    .sort((a, b) => b.review_count - a.review_count || (b.rating_avg ?? 0) - (a.rating_avg ?? 0) || a.name.localeCompare(b.name, "es"))
    .slice(0, 8);

  const familyCounts: Record<string, number> = {};
  perfumes.forEach((p) => p.family && (familyCounts[p.family.slug] = (familyCounts[p.family.slug] ?? 0) + 1));

  const notes = [...new Map(perfumes.flatMap((p) => p.notes.map((n) => [n.note.slug, n.note] as [string, Note]))).values()].slice(0, 24);

  return (
    <>
      <Hero />
      <NotesMarquee notes={notes} />

      {/* 1. Más reseñados */}
      <section className="container-editorial pt-24 sm:pt-32">
        <SectionHeading
          eyebrow="Lo que la comunidad comenta"
          title={<>Los perfumes <em className="text-forest">más reseñados</em></>}
          text="Ordenados por cantidad de reseñas publicadas por personas reales."
          href="/perfumes?orden=resenados"
        />
        {mostReviewed.length ? (
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {mostReviewed.map((p) => (
              <StaggerItem key={p.id}>
                <PerfumeCard perfume={p} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState title="El catálogo está vacío" text="Cuando el equipo cargue perfumes desde el panel, aparecerán aquí." />
        )}
      </section>

      {/* 2. Familias */}
      <section className="mt-28 bg-ivory py-24 sm:mt-36 sm:py-28">
        <div className="container-editorial">
          <SectionHeading
            eyebrow="Explorá por familia olfativa"
            title={<>Descubrí tu <em className="text-forest">próximo perfume</em></>}
            text="Cada familia agrupa perfumes con un carácter común. Elegí la que más te atrae y empezá a explorar."
          />
          <FamilyGrid families={families} counts={familyCounts} />
        </div>
      </section>

      {/* 3. Últimas reseñas */}
      <section className="container-editorial pt-24 sm:pt-32">
        <SectionHeading
          eyebrow="Voces de la comunidad"
          title={<>Últimas <em className="text-forest">reseñas</em></>}
          href={latest.total ? "/resenas" : undefined}
          linkLabel="Ver todas las reseñas"
        />
        {latest.reviews.length ? (
          <Stagger className="grid gap-5 md:grid-cols-3">
            {latest.reviews.map((r) => (
              <StaggerItem key={r.id}>
                <ReviewSnippet review={r} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            title="Todavía no hay reseñas"
            text="Las reseñas de Reseñarte son escritas por personas reales. Podés ser quien publique la primera."
            action={<Link href="/perfumes" className="btn btn-primary">Elegir un perfume para reseñar</Link>}
          />
        )}
      </section>

      {/* 4. Tendencia */}
      <section className="container-editorial pt-24 sm:pt-32">
        <SectionHeading
          eyebrow="Actividad de los últimos 30 días"
          title={<>Perfumes <em className="text-forest">tendencia</em></>}
          text="Calculado con reseñas, favoritos y colecciones recientes. Sin métricas inventadas."
        />
        {trending.length ? (
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {trending.map((t, i) => (
              <StaggerItem key={t.perfume.id}>
                <PerfumeCard
                  perfume={t.perfume}
                  extra={
                    <p className="mt-2 text-xs text-chocolate">
                      <span className="font-serif text-base italic">#{i + 1}</span> · {plural(t.reviews, "reseña", "reseñas")},{" "}
                      {plural(t.favorites, "favorito", "favoritos")} este mes
                    </p>
                  }
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            title="Aún no hay suficiente actividad"
            text="Las tendencias aparecen cuando la comunidad empieza a reseñar, guardar favoritos y armar colecciones."
          />
        )}
      </section>

      {/* 5. CTA comunidad */}
      <section className="container-editorial pt-28 sm:pt-36">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-3xl bg-forest px-6 py-16 text-white sm:px-14 sm:py-20">
            <div className="absolute -top-24 -right-24 size-80 rounded-full border border-white/10" />
            <div className="absolute -top-10 -right-10 size-52 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-white/[0.03]" />
            <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow !text-sage-light">Sumate a la comunidad</p>
                <h2 className="mt-4 text-5xl leading-[1.02] !text-white sm:text-6xl">
                  Tu nariz también <em>tiene algo para contar.</em>
                </h2>
                <p className="mt-5 max-w-md text-white/75">
                  Creá tu cuenta gratis, armá tu estantería de perfumes y publicá tu primera reseña en pocos pasos.
                </p>
                <Link href={user ? "/perfumes" : "/ingresar?modo=registro"} className="btn group mt-8 bg-white text-forest hover:bg-ivory">
                  {user ? "Elegir un perfume para reseñar" : "Crear mi cuenta"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <ol className="space-y-4">
                {[
                  { icon: UserPlus, t: "Registrate", d: "Con email o Google, en menos de un minuto." },
                  { icon: BookmarkPlus, t: "Armá tu colección", d: "Los que tenés, los que tuviste y los que querés." },
                  { icon: PenLine, t: "Publicá tu reseña", d: "Contá cómo evoluciona en tu piel y cuánto dura." },
                ].map((s, i) => (
                  <li key={s.t} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                    <span className="font-serif text-3xl text-sage-light italic">0{i + 1}</span>
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        <s.icon className="size-4 text-sage-light" /> {s.t}
                      </p>
                      <p className="mt-1 text-sm text-white/65">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
