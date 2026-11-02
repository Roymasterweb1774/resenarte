import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    if (p > 1) sp.set("pagina", String(p));
    else sp.delete("pagina");
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav aria-label="Paginación" className="mt-16 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className="rounded-full border border-line p-2.5 hover:border-forest" aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "grid size-10 place-items-center rounded-full text-sm transition-colors",
            p === page ? "bg-forest text-white" : "hover:bg-ivory",
          )}
        >
          {p}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className="rounded-full border border-line p-2.5 hover:border-forest" aria-label="Página siguiente">
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
