"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { REVIEW_LIMITS } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";
import { extFor, getContext, validateImage } from "./_shared";

const REBUY = ["si", "no", "no_seguro"];
const TRIED = ["frasco", "decant", "tienda", "prestado"];

function revalidatePerfume(slug: string) {
  revalidatePath(`/perfumes/${slug}`);
  revalidatePath("/");
  revalidatePath("/resenas");
  revalidatePath("/perfumes");
}

export async function saveReview(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb, user } = ctx;

  const perfumeId = String(formData.get("perfume_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const longevity = Number(formData.get("longevity")) || null;
  const sillage = Number(formData.get("sillage")) || null;
  const wouldRebuy = String(formData.get("would_rebuy") ?? "");
  const triedVia = String(formData.get("tried_via") ?? "");
  const photo = formData.get("photo") as File | null;
  const removePhoto = formData.get("remove_photo") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!(rating >= 1 && rating <= 5)) fieldErrors.rating = "Elegí una calificación de 1 a 5 estrellas.";
  if (title.length < REVIEW_LIMITS.titleMin || title.length > REVIEW_LIMITS.titleMax)
    fieldErrors.title = `El título debe tener entre ${REVIEW_LIMITS.titleMin} y ${REVIEW_LIMITS.titleMax} caracteres.`;
  if (body.length < REVIEW_LIMITS.bodyMin || body.length > REVIEW_LIMITS.bodyMax)
    fieldErrors.body = `Tu experiencia debe tener entre ${REVIEW_LIMITS.bodyMin} y ${REVIEW_LIMITS.bodyMax} caracteres.`;
  if (longevity && (longevity < 1 || longevity > 5)) fieldErrors.longevity = "Valor no válido.";
  if (sillage && (sillage < 1 || sillage > 4)) fieldErrors.sillage = "Valor no válido.";
  if (wouldRebuy && !REBUY.includes(wouldRebuy)) fieldErrors.would_rebuy = "Valor no válido.";
  if (triedVia && !TRIED.includes(triedVia)) fieldErrors.tried_via = "Valor no válido.";
  const imgError = validateImage(photo);
  if (imgError) fieldErrors.photo = imgError;
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Revisá los campos marcados.", fieldErrors };

  const { data: perfume } = await sb.from("perfumes").select("id, slug").eq("id", perfumeId).maybeSingle();
  if (!perfume) return { ok: false, error: "No encontramos este perfume." };

  const { data: existing } = await sb
    .from("reviews")
    .select("id, photo_url")
    .eq("perfume_id", perfumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  let photoUrl: string | null = removePhoto ? null : (existing?.photo_url ?? null);
  if (photo && photo.size > 0) {
    const path = `${user.id}/${perfumeId}-${Date.now()}.${extFor(photo.type)}`;
    const { error: upErr } = await sb.storage.from("review-photos").upload(path, photo, { contentType: photo.type });
    if (upErr) return { ok: false, error: "No pudimos subir la fotografía. Probá con otra imagen." };
    photoUrl = sb.storage.from("review-photos").getPublicUrl(path).data.publicUrl;
  }

  const payload = {
    rating,
    title,
    body,
    longevity,
    sillage,
    would_rebuy: wouldRebuy || null,
    tried_via: triedVia || null,
    photo_url: photoUrl,
  };

  const { error } = existing
    ? await sb.from("reviews").update(payload).eq("id", existing.id)
    : await sb.from("reviews").insert({ ...payload, perfume_id: perfumeId, user_id: user.id });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya publicaste una reseña de este perfume. Podés editarla." };
    console.error("saveReview", error.message);
    return { ok: false, error: "No pudimos guardar tu reseña. Intentá nuevamente." };
  }

  if (longevity || sillage) {
    await sb
      .from("review_votes")
      .upsert(
        { user_id: user.id, perfume_id: perfumeId, longevity, sillage, updated_at: new Date().toISOString() },
        { onConflict: "user_id,perfume_id" },
      );
  }

  revalidatePerfume(slug || perfume.slug);
  redirect(`/perfumes/${perfume.slug}?resena=${existing ? "actualizada" : "publicada"}#resenas`);
}

export async function deleteReview(reviewId: string, slug: string): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { error, count } = await ctx.sb.from("reviews").delete({ count: "exact" }).eq("id", reviewId);
  if (error || !count) return { ok: false, error: "No pudimos eliminar la reseña." };
  revalidatePerfume(slug);
  return { ok: true, message: "Reseña eliminada." };
}

export async function toggleHelpful(reviewId: string, slug?: string): Promise<ActionResult<{ helpful: boolean }>> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb, user } = ctx;
  const { data: review } = await sb.from("reviews").select("user_id").eq("id", reviewId).maybeSingle();
  if (review?.user_id === user.id) return { ok: false, error: "No podés votar tu propia reseña." };
  const { data: existing } = await sb
    .from("review_helpful_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();
  const { error } = existing
    ? await sb.from("review_helpful_votes").delete().eq("review_id", reviewId).eq("user_id", user.id)
    : await sb.from("review_helpful_votes").insert({ review_id: reviewId, user_id: user.id });
  if (error) return { ok: false, error: "No pudimos registrar tu voto." };
  if (slug) revalidatePath(`/perfumes/${slug}`);
  return { ok: true, data: { helpful: !existing } };
}

export async function reportReview(reviewId: string, reason: string): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const clean = reason.trim();
  if (clean.length < 3) return { ok: false, error: "Contanos brevemente el motivo del reporte." };
  const { error } = await ctx.sb
    .from("review_reports")
    .insert({ review_id: reviewId, reporter_id: ctx.user.id, reason: clean.slice(0, 500) });
  if (error?.code === "23505") return { ok: false, error: "Ya reportaste esta reseña. Moderación la está revisando." };
  if (error) return { ok: false, error: "No pudimos enviar el reporte." };
  return { ok: true, message: "Gracias. Moderación revisará esta reseña." };
}
