import Link from "next/link";
import type { Note } from "@/lib/types";

/** Cinta infinita de notas olfativas registradas en el catálogo. */
export function NotesMarquee({ notes }: { notes: Note[] }) {
  if (!notes.length) return null;
  const loop = [...notes, ...notes];
  return (
    <div className="group relative overflow-hidden border-y border-line bg-white py-5" aria-label="Notas olfativas del catálogo">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <ul className="flex w-max animate-marquee items-center gap-10 group-hover:[animation-play-state:paused]">
        {loop.map((n, i) => (
          <li key={`${n.slug}-${i}`} className="flex items-center gap-10" aria-hidden={i >= notes.length}>
            <Link href={`/perfumes?nota=${n.slug}`} tabIndex={i >= notes.length ? -1 : 0} className="font-serif text-2xl text-ink/70 italic transition-colors hover:text-forest">
              {n.name}
            </Link>
            <span className="size-1.5 rounded-full bg-sage" />
          </li>
        ))}
      </ul>
    </div>
  );
}
