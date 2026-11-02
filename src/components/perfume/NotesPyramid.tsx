import Image from "next/image";
import Link from "next/link";
import { NOTE_LAYERS, NO_INFO } from "@/lib/constants";
import type { PerfumeNote } from "@/lib/types";
import { Stagger, StaggerItem } from "../motion/Reveal";

export function NotesPyramid({ notes }: { notes: PerfumeNote[] }) {
  if (!notes.length) return <p className="text-sm text-muted">{NO_INFO}</p>;
  return (
    <div className="space-y-4">
      {NOTE_LAYERS.map((layer, li) => {
        const items = notes.filter((n) => n.layer === layer.key);
        return (
          <div key={layer.key} className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-[200px_1fr] sm:p-6">
            <div className="flex items-start gap-3">
              {/* nivel de la pirámide */}
              <svg viewBox="0 0 40 34" className="mt-1 h-7 w-8 shrink-0" aria-hidden>
                <path d="M20 2 L38 32 H2 Z" fill="none" stroke="#C9C3B8" strokeWidth="1.2" />
                <path
                  d={li === 0 ? "M20 2 L26 12 H14 Z" : li === 1 ? "M14 12 H26 L32 22 H8 Z" : "M8 22 H32 L38 32 H2 Z"}
                  fill="#344B38"
                />
              </svg>
              <div>
                <h3 className="text-2xl leading-none">{layer.label}</h3>
                <p className="mt-1.5 text-xs text-muted">{layer.hint}</p>
              </div>
            </div>
            {items.length ? (
              <Stagger className="flex flex-wrap gap-3" gap={0.05}>
                {items.map(({ note }) => (
                  <StaggerItem key={note.id}>
                    <Link
                      href={`/perfumes?nota=${note.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-line bg-white py-2 pr-4 pl-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage hover:shadow-[0_10px_24px_-16px_rgba(52,75,56,0.5)]"
                    >
                      {note.image_url ? (
                        <Image src={note.image_url} alt="" width={36} height={36} className="size-9 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-9 place-items-center rounded-lg bg-ivory font-serif text-lg text-chocolate italic transition-colors group-hover:bg-sage-light group-hover:text-forest">
                          {note.name[0]}
                        </span>
                      )}
                      <span className="text-sm">{note.name}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <p className="self-center text-sm text-muted">{NO_INFO}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
