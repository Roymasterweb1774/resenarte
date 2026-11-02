import Link from "next/link";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Stars } from "../ui/Stars";

/** Fragmento de reseña para listados (home, feed de comunidad, perfiles). */
export function ReviewSnippet({ review }: { review: Review }) {
  const author = review.author;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-shadow duration-500 hover:shadow-[0_24px_48px_-32px_rgba(52,75,56,0.5)]">
      <div className="flex items-center gap-3">
        <Avatar name={author?.display_name ?? "Usuario"} src={author?.avatar_url} size={36} />
        <div className="min-w-0 flex-1">
          {author ? (
            <Link href={`/perfil/${author.username}`} className="block truncate text-sm font-medium hover:text-forest">
              {author.display_name}
            </Link>
          ) : (
            <span className="text-sm">Usuario</span>
          )}
          <time className="text-xs text-muted" dateTime={review.created_at}>
            {formatDate(review.created_at)}
          </time>
        </div>
        <Stars value={review.rating} size={12} />
      </div>
      {review.perfume && (
        <Link href={`/perfumes/${review.perfume.slug}`} className="mt-5 block">
          <p className="eyebrow">{review.perfume.brand_name}</p>
          <p className="font-serif text-xl leading-tight hover:text-forest">{review.perfume.name}</p>
        </Link>
      )}
      <h3 className="mt-3 text-[1.35rem] leading-snug italic">“{review.title}”</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/75">{review.body}</p>
      {review.perfume && (
        <Link href={`/perfumes/${review.perfume.slug}#resenas`} className="link-underline mt-auto self-start pt-4 text-xs text-forest">
          Leer reseña completa
        </Link>
      )}
    </article>
  );
}
