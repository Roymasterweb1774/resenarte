"use client";

import { motion } from "framer-motion";
import { EyeOff, Flag, Loader2, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { moderateReview } from "@/app/actions/admin";
import { deleteReview, reportReview, toggleHelpful } from "@/app/actions/reviews";
import { LONGEVITY, REBUY_SHORT, SILLAGE, TRIED_VIA } from "@/lib/constants";
import type { Review } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";
import { Stars } from "../ui/Stars";
import { useToast } from "../ui/Toast";

export function ReviewCard({
  review,
  slug,
  viewerId,
  isModerator,
}: {
  review: Review;
  slug: string;
  viewerId: string | null;
  isModerator: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [helpful, setHelpful] = useState(review.viewer_found_helpful);
  const [count, setCount] = useState(review.helpful_count);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [photoOpen, setPhotoOpen] = useState(false);

  const isOwner = viewerId === review.user_id;
  const author = review.author;

  const needLogin = () => {
    toast("Iniciá sesión para participar.", "error");
    router.push(`/ingresar?next=${encodeURIComponent(`/perfumes/${slug}#resenas`)}`);
  };

  const onHelpful = () => {
    if (!viewerId) return needLogin();
    const prev = helpful;
    setHelpful(!prev);
    setCount((c) => c + (prev ? -1 : 1));
    start(async () => {
      const res = await toggleHelpful(review.id);
      if (!res.ok) {
        setHelpful(prev);
        setCount((c) => c + (prev ? 1 : -1));
        toast(res.error, "error");
      }
    });
  };

  const onReport = () =>
    start(async () => {
      const res = await reportReview(review.id, reason);
      if (res.ok) {
        setReportOpen(false);
        setReason("");
        toast(res.message ?? "Reporte enviado");
      } else toast(res.error, "error");
    });

  const onDelete = () =>
    start(async () => {
      const res = await deleteReview(review.id, slug);
      if (res.ok) {
        setDeleteOpen(false);
        toast(res.message ?? "Reseña eliminada");
        router.refresh();
      } else toast(res.error, "error");
    });

  const onHide = () =>
    start(async () => {
      const res = await moderateReview(review.id, review.status === "hidden" ? "published" : "hidden");
      if (res.ok) {
        toast(res.message ?? "Listo");
        router.refresh();
      } else toast(res.error, "error");
    });

  const meta = [
    review.longevity && { k: "Duración", v: LONGEVITY[review.longevity - 1] },
    review.sillage && { k: "Proyección", v: SILLAGE[review.sillage - 1] },
    review.would_rebuy && { k: "¿Lo volvería a comprar?", v: REBUY_SHORT[review.would_rebuy] },
    review.tried_via && { k: "Cómo lo probó", v: TRIED_VIA[review.tried_via] },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("border-b border-line py-9 first:pt-0", review.status === "hidden" && "opacity-70")}
    >
      <header className="flex flex-wrap items-center gap-3">
        <Avatar name={author?.display_name ?? "Usuario"} src={author?.avatar_url} size={44} />
        <div className="min-w-0 flex-1">
          {author ? (
            <Link href={`/perfil/${author.username}`} className="font-medium hover:text-forest">
              {author.display_name}
            </Link>
          ) : (
            <span className="font-medium">Usuario</span>
          )}
          <p className="text-xs text-muted">
            <time dateTime={review.created_at}>{formatDate(review.created_at)}</time>
            {review.edited_at && <> · editada el {formatDate(review.edited_at)}</>}
          </p>
        </div>
        <Stars value={review.rating} size={15} />
      </header>

      {review.status === "hidden" && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-danger/5 px-3 py-1.5 text-xs text-danger">
          <EyeOff className="size-3.5" /> Oculta por moderación — solo vos {isModerator && "y moderación "}la ven.
        </p>
      )}

      <h3 className="mt-5 text-[1.7rem] leading-snug">{review.title}</h3>
      <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/80">{review.body}</p>

      {review.photo_url && (
        <button onClick={() => setPhotoOpen(true)} className="mt-5 block overflow-hidden rounded-xl" aria-label="Ampliar fotografía de la reseña">
          <Image src={review.photo_url} alt={`Fotografía de ${author?.display_name ?? "un usuario"}`} width={220} height={220} className="size-40 object-cover transition-transform duration-500 hover:scale-105" />
        </button>
      )}

      {meta.length > 0 && (
        <dl className="mt-5 flex flex-wrap gap-2">
          {meta.map((m) => (
            <div key={m.k} className="rounded-full bg-ivory px-3.5 py-1.5 text-xs">
              <dt className="inline text-muted">{m.k}: </dt>
              <dd className="inline text-ink">{m.v}</dd>
            </div>
          ))}
        </dl>
      )}

      <footer className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        {!isOwner && (
          <button
            onClick={onHelpful}
            disabled={pending}
            aria-pressed={helpful}
            className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors", helpful ? "border-forest bg-forest text-white" : "border-line hover:border-forest/50")}
          >
            <ThumbsUp className="size-3.5" /> Me resultó útil {count > 0 && <span className="tabular-nums">· {count}</span>}
          </button>
        )}
        {isOwner && count > 0 && <span className="text-xs text-muted">A {count} {count === 1 ? "persona le" : "personas les"} resultó útil</span>}
        {!isOwner && (
          <button onClick={() => (viewerId ? setReportOpen(true) : needLogin())} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted hover:bg-ivory hover:text-ink">
            <Flag className="size-3.5" /> Reportar
          </button>
        )}
        {isOwner && (
          <>
            <Link href={`/perfumes/${slug}/resena`} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-forest hover:bg-ivory">
              <Pencil className="size-3.5" /> Editar
            </Link>
            <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-danger hover:bg-danger/5">
              <Trash2 className="size-3.5" /> Eliminar
            </button>
          </>
        )}
        {isModerator && !isOwner && (
          <button onClick={onHide} disabled={pending} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-danger/30 px-3 py-1.5 text-xs text-danger hover:bg-danger/5">
            <EyeOff className="size-3.5" /> {review.status === "hidden" ? "Restaurar" : "Ocultar"}
          </button>
        )}
      </footer>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Reportar reseña" size="sm">
        <p className="mb-4 text-sm text-muted">Contanos por qué esta reseña no cumple las normas de la comunidad. Moderación lo revisará.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={500} className="input" placeholder="Ej.: contenido ofensivo, spam, no habla del perfume..." aria-label="Motivo del reporte" />
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setReportOpen(false)} className="btn btn-outline">Cancelar</button>
          <button onClick={onReport} disabled={pending || reason.trim().length < 3} className="btn btn-primary">
            {pending && <Loader2 className="size-4 animate-spin" />} Enviar reporte
          </button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="¿Eliminar tu reseña?" size="sm">
        <p className="text-sm text-muted">Esta acción no se puede deshacer. La valoración media del perfume se recalculará automáticamente.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setDeleteOpen(false)} className="btn btn-outline">Cancelar</button>
          <button onClick={onDelete} disabled={pending} className="btn bg-danger text-white hover:bg-danger/90">
            {pending && <Loader2 className="size-4 animate-spin" />} Sí, eliminar
          </button>
        </div>
      </Modal>

      {review.photo_url && (
        <Modal open={photoOpen} onClose={() => setPhotoOpen(false)} title={review.title}>
          <Image src={review.photo_url} alt="" width={900} height={900} className="h-auto w-full rounded-xl" />
        </Modal>
      )}
    </motion.article>
  );
}
