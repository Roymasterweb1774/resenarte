"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CONCENTRATIONS, GENDERS, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

const FILTER_KEYS = ["marca", "familia", "nota", "genero", "conc", "min", "desde", "hasta"];

export function CatalogFilters({
  brands,
  families,
  notes,
  hasQuery,
  children,
}: {
  brands: Option[];
  families: Option[];
  notes: Option[];
  hasQuery: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("pagina");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const clear = () => {
    const next = new URLSearchParams();
    if (params.get("q")) next.set("q", params.get("q")!);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const active = FILTER_KEYS.filter((k) => params.get(k));

  const panel = (
    <div className="space-y-6">
      <Select label="Marca" value={params.get("marca") ?? ""} onChange={(v) => set("marca", v)} options={brands} />
      <Select label="Familia olfativa" value={params.get("familia") ?? ""} onChange={(v) => set("familia", v)} options={families} />
      <Select label="Nota" value={params.get("nota") ?? ""} onChange={(v) => set("nota", v)} options={notes} />

      <fieldset>
        <legend className="label">Género comercial</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GENDERS).map(([v, l]) => (
            <Chip key={v} active={params.get("genero") === v} onClick={() => set("genero", params.get("genero") === v ? "" : v)}>
              {l}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Concentración</legend>
        <div className="flex flex-wrap gap-2">
          {CONCENTRATIONS.map((c) => (
            <Chip key={c} active={params.get("conc") === c} onClick={() => set("conc", params.get("conc") === c ? "" : c)}>
              {c}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Valoración mínima</legend>
        <div className="flex flex-wrap gap-2">
          {[4, 3, 2].map((n) => (
            <Chip key={n} active={params.get("min") === String(n)} onClick={() => set("min", params.get("min") === String(n) ? "" : String(n))}>
              {n}★ o más
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Año de lanzamiento</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Desde"
            defaultValue={params.get("desde") ?? ""}
            onBlur={(e) => set("desde", e.target.value)}
            className="input !py-2 text-sm"
            aria-label="Año desde"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Hasta"
            defaultValue={params.get("hasta") ?? ""}
            onBlur={(e) => set("hasta", e.target.value)}
            className="input !py-2 text-sm"
            aria-label="Año hasta"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">Solo incluye perfumes con año conocido.</p>
      </fieldset>

      {active.length > 0 && (
        <button onClick={clear} className="btn btn-outline w-full">
          Limpiar filtros ({active.length})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <p className="eyebrow mb-6">Filtrar</p>
          {panel}
        </div>
      </aside>

      <div>
        <div className="mb-8 flex items-center justify-between gap-3 border-b border-line pb-4">
          <button onClick={() => setOpen(true)} className="btn btn-outline !py-2 lg:hidden">
            <SlidersHorizontal className="size-4" /> Filtros {active.length > 0 && `(${active.length})`}
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <span className="hidden sm:inline">Ordenar por</span>
            <select
              value={params.get("orden") ?? (hasQuery ? "relevancia" : "populares")}
              onChange={(e) => set("orden", e.target.value)}
              className="rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-forest focus:outline-none"
            >
              {hasQuery && <option value="relevancia">Relevancia</option>}
              {Object.entries(SORT_OPTIONS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={cn("transition-opacity duration-300", pending && "pointer-events-none opacity-50")} aria-busy={pending}>
          {children}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6"
              role="dialog"
              aria-label="Filtros"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl">Filtros</h2>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-ivory" aria-label="Cerrar filtros">
                  <X className="size-5" />
                </button>
              </div>
              {panel}
              <button onClick={() => setOpen(false)} className="btn btn-primary mt-6 w-full">
                Ver resultados
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Option[] }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input !py-2.5 text-sm">
        <option value="">Todas</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-all duration-300",
        active ? "border-forest bg-forest text-white" : "border-line bg-white text-ink/80 hover:border-forest/50",
      )}
    >
      {children}
    </button>
  );
}
