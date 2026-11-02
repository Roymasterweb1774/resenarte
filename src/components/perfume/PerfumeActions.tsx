"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Heart, Library, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { setCollectionStatus, toggleFavorite } from "@/app/actions/community";
import { COLLECTION_STATUS } from "@/lib/constants";
import type { CollectionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AuthForm } from "../auth/AuthForm";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

export function PerfumeActions({
  perfumeId,
  slug,
  loggedIn,
  hasOwnReview,
  initialFavorite,
  initialStatus,
}: {
  perfumeId: string;
  slug: string;
  loggedIn: boolean;
  hasOwnReview: boolean;
  initialFavorite: boolean;
  initialStatus: CollectionStatus | null;
}) {
  const toast = useToast();
  const [authNext, setAuthNext] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [status, setStatus] = useState(initialStatus);
  const [menu, setMenu] = useState(false);
  const [pending, start] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const reviewHref = `/perfumes/${slug}/resena`;

  useEffect(() => {
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const requireLogin = (next: string) => {
    if (loggedIn) return false;
    setAuthNext(next);
    return true;
  };

  const onFavorite = () => {
    if (requireLogin(`/perfumes/${slug}`)) return;
    const prev = favorite;
    setFavorite(!prev);
    start(async () => {
      const res = await toggleFavorite(perfumeId);
      if (!res.ok) {
        setFavorite(prev);
        toast(res.error, "error");
      } else toast(res.message ?? "Listo");
    });
  };

  const onStatus = (s: CollectionStatus | null) => {
    setMenu(false);
    if (requireLogin(`/perfumes/${slug}`)) return;
    const prev = status;
    setStatus(s);
    start(async () => {
      const res = await setCollectionStatus(perfumeId, s);
      if (!res.ok) {
        setStatus(prev);
        toast(res.error, "error");
      } else toast(res.message ?? "Listo");
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {loggedIn ? (
          <Link href={reviewHref} className="btn btn-primary">
            <PenLine className="size-4" /> {hasOwnReview ? "Editar mi reseña" : "Escribir reseña"}
          </Link>
        ) : (
          <button onClick={() => setAuthNext(reviewHref)} className="btn btn-primary">
            <PenLine className="size-4" /> Escribir reseña
          </button>
        )}

        <button onClick={onFavorite} disabled={pending} aria-pressed={favorite} className={cn("btn btn-outline", favorite && "!border-forest !text-forest")}>
          <motion.span key={String(favorite)} initial={{ scale: 0.6 }} animate={{ scale: [1.3, 1] }} transition={{ duration: 0.35 }}>
            <Heart className={cn("size-4", favorite && "fill-forest")} />
          </motion.span>
          {favorite ? "En favoritos" : "Añadir a favoritos"}
        </button>

        <div ref={menuRef} className="relative">
          <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className={cn("btn btn-outline", status && "!border-forest !text-forest")}>
            <Library className="size-4" />
            {status ? COLLECTION_STATUS[status] : "Añadir a mi colección"}
            <ChevronDown className={cn("size-4 transition-transform", menu && "rotate-180")} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.ul
                role="menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-[0_24px_60px_-24px_rgba(34,32,29,0.3)]"
              >
                {(Object.keys(COLLECTION_STATUS) as CollectionStatus[]).map((s) => (
                  <li key={s}>
                    <button role="menuitemradio" aria-checked={status === s} onClick={() => onStatus(s)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-ivory">
                      {COLLECTION_STATUS[s]}
                      {status === s && <Check className="size-4 text-forest" />}
                    </button>
                  </li>
                ))}
                {status && (
                  <li className="border-t border-line">
                    <button onClick={() => onStatus(null)} className="w-full px-4 py-2.5 text-left text-sm text-muted hover:bg-ivory">
                      Quitar de mi colección
                    </button>
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={!!authNext} onClose={() => setAuthNext(null)} title="Accedé a Reseñarte" size="sm">
        <p className="-mt-2 mb-6 text-sm text-muted">Para publicar reseñas y guardar perfumes necesitás una cuenta. Te traemos de vuelta enseguida.</p>
        {authNext && <AuthForm next={authNext} />}
      </Modal>
    </>
  );
}
