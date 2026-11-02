"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartOff, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { setCollectionStatus, toggleFavorite } from "@/app/actions/community";
import { COLLECTION_STATUS } from "@/lib/constants";
import type { CollectionStatus, Perfume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PerfumeCard } from "../perfume/PerfumeCard";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/Toast";

type Tab = CollectionStatus | "favoritos";
const TABS: [Tab, string][] = [...(Object.entries(COLLECTION_STATUS) as [Tab, string][]), ["favoritos", "Mis favoritos"]];

export function Shelf({
  perfumes,
  initialCollection,
  initialFavorites,
  initialTab,
  readOnly = false,
}: {
  perfumes: Perfume[];
  initialCollection: { perfume_id: string; status: CollectionStatus }[];
  initialFavorites: string[];
  initialTab?: string;
  readOnly?: boolean;
}) {
  const toast = useToast();
  const [, start] = useTransition();
  const [collection, setCollection] = useState(initialCollection);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [tab, setTab] = useState<Tab>(TABS.some(([t]) => t === initialTab) ? (initialTab as Tab) : "tengo");

  const byId = new Map(perfumes.map((p) => [p.id, p]));
  const count = (t: Tab) => (t === "favoritos" ? favorites.length : collection.filter((c) => c.status === t).length);
  const ids = tab === "favoritos" ? favorites : collection.filter((c) => c.status === tab).map((c) => c.perfume_id);
  const items = ids.map((id) => byId.get(id)).filter(Boolean) as Perfume[];

  const changeStatus = (perfumeId: string, status: CollectionStatus | null) => {
    const prev = collection;
    setCollection((c) => (status ? c.map((x) => (x.perfume_id === perfumeId ? { ...x, status } : x)) : c.filter((x) => x.perfume_id !== perfumeId)));
    start(async () => {
      const res = await setCollectionStatus(perfumeId, status);
      if (!res.ok) {
        setCollection(prev);
        toast(res.error, "error");
      } else toast(status ? `Movido a “${COLLECTION_STATUS[status]}”` : "Quitado de tu colección");
    });
  };

  const removeFavorite = (perfumeId: string) => {
    const prev = favorites;
    setFavorites((f) => f.filter((x) => x !== perfumeId));
    start(async () => {
      const res = await toggleFavorite(perfumeId);
      if (!res.ok) {
        setFavorites(prev);
        toast(res.error, "error");
      } else toast("Quitado de favoritos");
    });
  };

  return (
    <div>
      <div className="-mx-5 mb-10 overflow-x-auto px-5">
        <ul role="tablist" className="flex min-w-max gap-1 border-b border-line">
          {TABS.map(([t, label]) => (
            <li key={t}>
              <button
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn("relative px-4 py-3 text-sm transition-colors", tab === t ? "text-forest" : "text-muted hover:text-ink")}
              >
                {label} <span className="ml-1 text-xs tabular-nums opacity-70">{count(t)}</span>
                {tab === t && <motion.span layoutId="shelf-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-forest" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          {items.length ? (
            <div className="relative">
              {/* repisa */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence>
                  {items.map((p) => (
                    <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.35 }}>
                      <PerfumeCard
                        perfume={p}
                        extra={
                          readOnly ? null : tab === "favoritos" ? (
                            <button onClick={() => removeFavorite(p.id)} className="mt-3 inline-flex items-center gap-1.5 self-start text-xs text-muted hover:text-danger">
                              <HeartOff className="size-3.5" /> Quitar de favoritos
                            </button>
                          ) : (
                            <div className="mt-3 flex items-center gap-2">
                              <select
                                aria-label={`Estado de ${p.name}`}
                                value={tab}
                                onChange={(e) => changeStatus(p.id, e.target.value as CollectionStatus)}
                                className="min-w-0 flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-xs focus:border-forest focus:outline-none"
                              >
                                {Object.entries(COLLECTION_STATUS).map(([v, l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                              <button onClick={() => changeStatus(p.id, null)} aria-label={`Quitar ${p.name} de la colección`} className="rounded-lg border border-line p-1.5 text-muted hover:border-danger hover:text-danger">
                                <X className="size-3.5" />
                              </button>
                            </div>
                          )
                        }
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ) : (
            <EmptyState
              title={readOnly ? "Nada por aquí todavía" : "Tu estante está vacío"}
              text={readOnly ? undefined : "Agregá perfumes desde su ficha con el botón “Añadir a mi colección” o “Añadir a favoritos”."}
              action={readOnly ? undefined : <Link href="/perfumes" className="btn btn-primary">Explorar perfumes</Link>}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
