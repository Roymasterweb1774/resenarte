import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shelf } from "@/components/collection/Shelf";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllPerfumes, getCurrentUser, getUserShelf } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Mi colección", robots: { index: false } };

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-editorial pt-10">
        <EmptyState title="Tu colección te espera" text="La colección personal se activa al conectar la base de datos (modo demostración). Ver README." />
      </div>
    );
  }
  const user = await getCurrentUser();
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(`/coleccion${tab ? `?tab=${tab}` : ""}`)}`);

  const [perfumes, shelf] = await Promise.all([getAllPerfumes(), getUserShelf(user.id)]);

  return (
    <div className="container-editorial pt-8">
      <Reveal className="mb-12">
        <p className="eyebrow">Tu estantería</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          Mi <em className="text-forest">colección</em>
        </h1>
        <p className="mt-4 max-w-xl text-muted">Los perfumes que tenés, los que tuviste, los que querés y los que estás probando. Cambiá su estado cuando quieras.</p>
      </Reveal>
      <Shelf perfumes={perfumes} initialCollection={shelf.collection} initialFavorites={shelf.favorites} initialTab={tab} />
    </div>
  );
}
