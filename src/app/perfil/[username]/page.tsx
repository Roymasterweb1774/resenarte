import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shelf } from "@/components/collection/Shelf";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ReviewSnippet } from "@/components/review/ReviewSnippet";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllPerfumes, getCurrentUser, getProfileByUsername, getReviewsByUser, getUserShelf } from "@/lib/data";
import { formatDate, plural } from "@/lib/utils";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProfileByUsername((await params).username);
  return p ? { title: `${p.display_name} (@${p.username})`, description: p.bio ?? `Perfil de ${p.display_name} en Reseñarte.` } : { title: "Perfil no encontrado" };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfileByUsername((await params).username);
  if (!profile) notFound();
  const viewer = await getCurrentUser();
  const isOwn = viewer?.id === profile.id;

  const [reviews, shelf, perfumes] = await Promise.all([getReviewsByUser(profile.id, viewer?.id), getUserShelf(profile.id), getAllPerfumes()]);
  const showShelf = isOwn || profile.show_collection || profile.show_favorites;

  return (
    <div className="container-editorial pt-8">
      <Reveal className="grid gap-8 border-b border-line pb-12 md:grid-cols-[auto_1fr_auto] md:items-end">
        <Avatar name={profile.display_name} src={profile.avatar_url} size={112} />
        <div>
          <p className="eyebrow">@{profile.username}{profile.role !== "user" && ` · ${profile.role === "admin" ? "Equipo editorial" : "Moderación"}`}</p>
          <h1 className="mt-2 text-5xl leading-none sm:text-6xl">{profile.display_name}</h1>
          {profile.bio && <p className="mt-4 max-w-xl font-serif text-xl text-ink/75 italic">{profile.bio}</p>}
          <p className="mt-4 text-xs text-muted">
            En Reseñarte desde el {formatDate(profile.created_at)} · {plural(reviews.length, "reseña", "reseñas")}
            {(isOwn || profile.show_favorites) && ` · ${plural(shelf.favorites.length, "favorito", "favoritos")}`}
          </p>
        </div>
        {isOwn && <Link href="/ajustes" className="btn btn-outline">Editar perfil</Link>}
      </Reveal>

      <section className="mt-16">
        <h2 className="mb-8 text-4xl">Reseñas publicadas</h2>
        {reviews.length ? (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <StaggerItem key={r.id}>
                <ReviewSnippet review={r} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState title="Aún no publicó reseñas" />
        )}
      </section>

      {showShelf && (
        <section className="mt-20">
          <h2 className="mb-8 text-4xl">Estantería</h2>
          <Shelf
            perfumes={perfumes}
            initialCollection={isOwn || profile.show_collection ? shelf.collection : []}
            initialFavorites={isOwn || profile.show_favorites ? shelf.favorites : []}
            readOnly={!isOwn}
          />
        </section>
      )}
    </div>
  );
}
