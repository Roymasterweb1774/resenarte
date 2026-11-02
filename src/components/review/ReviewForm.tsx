"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";
import { saveReview } from "@/app/actions/reviews";
import { IMAGE_LIMITS, LONGEVITY, REBUY_SHORT, REVIEW_LIMITS, SILLAGE, TRIED_VIA } from "@/lib/constants";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATING_WORDS = ["", "No me gustó", "Regular", "Está bien", "Me gusta mucho", "Me encanta"];

export function ReviewForm({ perfumeId, slug, existing }: { perfumeId: string; slug: string; existing: Review | null }) {
  const [state, action, pending] = useActionState(saveReview, null);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [longevity, setLongevity] = useState(existing?.longevity?.toString() ?? "");
  const [sillage, setSillage] = useState(existing?.sillage?.toString() ?? "");
  const [rebuy, setRebuy] = useState<string>(existing?.would_rebuy ?? "");
  const [tried, setTried] = useState<string>(existing?.tried_via ?? "");
  const [preview, setPreview] = useState<string | null>(existing?.photo_url ?? null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const serverErrors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const errors: Record<string, string | undefined> = { ...serverErrors, ...(photoError ? { photo: photoError } : {}) };

  const onFile = (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (!IMAGE_LIMITS.types.includes(file.type)) {
      setPhotoError("Formato no admitido. Usá JPG, PNG o WebP.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > IMAGE_LIMITS.maxBytes) {
      setPhotoError("La imagen supera los 5 MB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (fileRef.current) fileRef.current.value = "";
    setPreview(null);
    setRemovePhoto(true);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  const shown = hover || rating;

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      <input type="hidden" name="perfume_id" value={perfumeId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating || ""} />
      {removePhoto && <input type="hidden" name="remove_photo" value="on" />}

      {/* Calificación */}
      <fieldset>
        <legend className="label !text-base">Calificación general <span className="text-danger">*</span></legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1" role="radiogroup" aria-label="Calificación de 1 a 5 estrellas" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") setRating(Math.min(5, (rating || 0) + 1));
                  if (e.key === "ArrowLeft") setRating(Math.max(1, (rating || 2) - 1));
                }}
                whileTap={{ scale: 0.85 }}
                animate={{ scale: shown >= n ? 1.08 : 1 }}
                className="p-1"
              >
                <Star className={cn("size-9 transition-colors", shown >= n ? "fill-chocolate text-chocolate" : "text-line")} strokeWidth={1.2} />
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {shown > 0 && (
              <motion.span key={shown} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-serif text-xl text-chocolate italic">
                {RATING_WORDS[shown]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {errors.rating && <p className="field-error">{errors.rating}</p>}
      </fieldset>

      {/* Título */}
      <label className="block">
        <span className="label !text-base">Título de la reseña <span className="text-danger">*</span></span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={REVIEW_LIMITS.titleMax}
          placeholder="Una vainilla cálida perfecta para invierno"
          className="input font-serif !text-xl"
          aria-invalid={!!errors.title}
        />
        <Counter n={title.length} max={REVIEW_LIMITS.titleMax} />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </label>

      {/* Texto */}
      <label className="block">
        <span className="label !text-base">Tu experiencia con este perfume <span className="text-danger">*</span></span>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={9}
          maxLength={REVIEW_LIMITS.bodyMax}
          placeholder="¿A qué te huele? ¿Cómo evoluciona en tu piel? ¿Lo volverías a comprar? Contanos tu experiencia..."
          className="input leading-relaxed"
          aria-invalid={!!errors.body}
        />
        <Counter n={body.length} max={REVIEW_LIMITS.bodyMax} min={REVIEW_LIMITS.bodyMin} />
        {errors.body && <p className="field-error">{errors.body}</p>}
      </label>

      <Segmented name="longevity" label="Duración" value={longevity} onChange={setLongevity} options={LONGEVITY.map((l, i) => [String(i + 1), l])} error={errors.longevity} />
      <Segmented name="sillage" label="Proyección" value={sillage} onChange={setSillage} options={SILLAGE.map((l, i) => [String(i + 1), l])} error={errors.sillage} />
      <Segmented name="would_rebuy" label="¿Lo volverías a comprar?" value={rebuy} onChange={setRebuy} options={Object.entries(REBUY_SHORT)} error={errors.would_rebuy} />
      <Segmented name="tried_via" label="¿Cómo lo probaste?" value={tried} onChange={setTried} options={Object.entries(TRIED_VIA)} error={errors.tried_via} />

      {/* Foto */}
      <div>
        <span className="label !text-base">Fotografía opcional</span>
        <p className="mb-3 text-xs text-muted">Una foto original tuya del perfume. JPG, PNG o WebP, hasta 5 MB.</p>
        <div className="flex items-center gap-4">
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Vista previa" className="size-28 rounded-xl object-cover" />
              <button type="button" onClick={clearPhoto} className="absolute -top-2 -right-2 rounded-full bg-ink p-1 text-white" aria-label="Quitar fotografía">
                <X className="size-3.5" />
              </button>
            </div>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-ink/80 transition-colors hover:border-forest hover:text-forest">
            <ImagePlus className="size-4" /> {preview ? "Cambiar foto" : "Subir foto"}
            <input ref={fileRef} type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
        {errors.photo && <p className="field-error">{errors.photo}</p>}
      </div>

      <AnimatePresence>
        {state && !state.ok && (
          <motion.p role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
        <button type="submit" disabled={pending || !!photoError} className="btn btn-primary !px-8 !py-3.5 text-base">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {existing ? "Guardar cambios" : "Publicar mi reseña"}
        </button>
        <p className="text-xs text-muted">Al publicar aceptás las normas de la comunidad.</p>
      </div>
    </form>
  );
}

function Counter({ n, max, min }: { n: number; max: number; min?: number }) {
  return (
    <p className={cn("mt-1.5 text-right text-xs tabular-nums", min && n > 0 && n < min ? "text-chocolate" : "text-muted")}>
      {min && n < min ? `Mínimo ${min} caracteres · ` : ""}
      {n}/{max}
    </p>
  );
}

function Segmented({
  name,
  label,
  value,
  onChange,
  options,
  error,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="label !text-base">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <label
            key={v}
            className={cn(
              "relative cursor-pointer rounded-full border px-4 py-2 text-sm transition-all duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/40",
              value === v ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest/50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              onClick={() => value === v && onChange("")}
              className="sr-only"
            />
            {l}
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}
