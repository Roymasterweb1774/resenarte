import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ReviewSnippet } from "@/components/review/ReviewSnippet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getLatestReviews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reseñas de la comunidad",
  description: "Las últimas reseñas de perfumes escritas por la comunidad de Reseñarte.",
  alternates: { canonical: "/resenas" },
};

const PER_PAGE = 12;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const page = Math.max(1, Number((await searchParams).pagina) || 1);
  const { reviews, total } = await getLatestReviews(PER_PAGE, (page - 1) * PER_PAGE);

  return (
    <div className="container-editorial pt-8">
      <Reveal className="mx-auto max-w-3xl pb-14 text-center">
        <p className="eyebrow">Comunidad</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          Reseñas <em className="text-forest">recientes</em>
        </h1>
        <p className="mt-4 text-muted">Opiniones reales, escritas por personas que probaron cada perfume.</p>
      </Reveal>
      {reviews.length ? (
        <>
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <StaggerItem key={r.id}>
                <ReviewSnippet review={r} />
              </StaggerItem>
            ))}
          </Stagger>
          <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} basePath="/resenas" params={{}} />
        </>
      ) : (
        <EmptyState
          title="Todavía no hay reseñas publicadas"
          text="Cuando la comunidad empiece a escribir, sus reseñas aparecerán aquí."
          action={<Link href="/perfumes" className="btn btn-primary">Explorar perfumes</Link>}
        />
      )}
    </div>
  );
}
