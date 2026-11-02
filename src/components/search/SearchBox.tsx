"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Droplet, Loader2, Search, Sparkles, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Suggestion } from "@/lib/search";
import { cn } from "@/lib/utils";

const ICONS = { perfume: Sparkles, marca: Tag, nota: Droplet };

export function SearchBox({
  size = "hero",
  autoFocus = false,
  onNavigate,
  defaultValue = "",
}: {
  size?: "hero" | "compact";
  autoFocus?: boolean;
  onNavigate?: () => void;
  defaultValue?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const json = await res.json();
        setItems(json.suggestions ?? []);
        setActive(-1);
      } catch {
        /* petición cancelada */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active].href);
    go(q.trim() ? `/perfumes?q=${encodeURIComponent(q.trim())}` : "/perfumes");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Escape") setOpen(false);
  };

  const hero = size === "hero";
  const showList = open && q.trim().length >= 2;

  return (
    <div ref={wrap} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted", hero ? "left-5 size-5" : "left-4 size-4")} />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          autoFocus={autoFocus}
          placeholder="Buscar perfumes, marcas o notas olfativas..."
          aria-label="Buscar perfumes, marcas o notas olfativas"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={cn(
            "w-full rounded-full border border-line bg-white text-ink placeholder:text-muted/80 transition-all duration-300 focus:border-forest focus:shadow-[0_0_0_4px_rgba(52,75,56,0.08)] focus:outline-none",
            hero ? "py-[1.15rem] pr-14 pl-14 text-base shadow-[0_20px_50px_-30px_rgba(89,69,55,0.4)]" : "py-3 pr-10 pl-11 text-sm",
          )}
        />
        {loading && <Loader2 className="absolute top-1/2 right-5 size-4 -translate-y-1/2 animate-spin text-muted" />}
      </form>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white py-2 text-left shadow-[0_24px_60px_-24px_rgba(34,32,29,0.3)]"
          >
            {items.length === 0 && !loading && (
              <li className="px-5 py-4 text-sm text-muted">
                Sin sugerencias para “{q}”. Pulsá Enter para buscar en el catálogo.
              </li>
            )}
            {items.map((s, i) => {
              const Icon = ICONS[s.type];
              return (
                <li key={s.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(s.href)}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                      i === active ? "bg-ivory" : "hover:bg-ivory",
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sage-light text-forest">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-lg leading-tight">{s.label}</span>
                      <span className="block text-xs text-muted">{s.sub}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
