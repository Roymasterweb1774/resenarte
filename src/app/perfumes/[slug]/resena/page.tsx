import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { Reveal } from "@/components/motion/Reveal";
import { PerfumeVisual } from "@/components/perfume/PerfumeVisual";
import { ReviewForm } from "@/components/review/ReviewForm";
import { getCurrentUser, getOwnReview, getPerfumeBySlug } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPerfumeBySlug((await params).slug);
  return { title: p ? `Reseñar ${p.name}` : "Escribir reseña", robots: { index: false } };
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const perfume = await getPerfumeBySlug(slug);
  if (!perfume) notFound();
  const user = await getCurrentUser();
  const existing = user ? await getOwnReview(perfume.id, user.id) : null;
  const next = `/perfumes/${perfume.slug}/resena`;

  return (
    <div className="container-editorial pt-6">
      <div className="grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Link href={`/perfumes/${perfume.slug}`} className="text-xs text-muted hover:text-forest">← Volver a la ficha</Link>
            <PerfumeVisual perfume={perfume} className="mt-5 aspect-[4/5] rounded-2xl border border-line" />
            <p className="eyebrow mt-5">{perfume.brand.name}</p>
            <p className="font-serif text-3xl">{perfume.name}</p>
          </Reveal>
        </aside>

        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{existing ? "Editar reseña" : "Nueva reseña"}</p>
            <h1 className="mt-3 text-5xl sm:text-6xl">
              {existing ? <>Actualizá tu <em className="text-forest">experiencia</em></> : <>Contanos tu <em className="text-forest">experiencia</em></>}
            </h1>
            <p className="mt-4 text-muted">
              Una reseña honesta ayuda a otras personas a descubrir perfumes. Podés tener una reseña por perfume y editarla cuando quieras.
            </p>
          </Reveal>

          <div className="mt-12">
            {!isSupabaseConfigured() ? (
              <p className="rounded-2xl bg-ivory p-6 text-sm text-chocolate">
                Para publicar reseñas hay que conectar la base de datos Supabase. Seguí los pasos del README.
              </p>
            ) : !user ? (
              <div className="max-w-md rounded-2xl border border-line p-6 sm:p-8">
                <h2 className="mb-2 text-3xl">Accedé para reseñar</h2>
                <p className="mb-6 text-sm text-muted">Solo las personas registradas pueden publicar. Después de ingresar volvés directo a este formulario.</p>
                <AuthForm next={next} />
              </div>
            ) : user.profile?.is_banned ? (
              <p className="rounded-2xl bg-danger/5 p-6 text-sm text-danger">Tu cuenta está suspendida y no puede publicar reseñas.</p>
            ) : (
              <ReviewForm perfumeId={perfume.id} slug={perfume.slug} existing={existing} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
