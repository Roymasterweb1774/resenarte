"use server";

import { revalidatePath } from "next/cache";
import { DAYTIME, OCCASIONS, SEASONS } from "@/lib/constants";
import type { ActionResult, CollectionStatus } from "@/lib/types";
import { getContext } from "./_shared";

const STATUSES: CollectionStatus[] = ["tengo", "tuve", "quiero", "probando"];

export async function submitVote(
  perfumeId: string,
  slug: string,
  vote: { longevity: number | null; sillage: number | null; seasons: string[]; daytime: string | null; occasions: string[] },
): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const clean = {
    user_id: ctx.user.id,
    perfume_id: perfumeId,
    longevity: vote.longevity && vote.longevity >= 1 && vote.longevity <= 5 ? vote.longevity : null,
    sillage: vote.sillage && vote.sillage >= 1 && vote.sillage <= 4 ? vote.sillage : null,
    seasons: vote.seasons.filter((s) => s in SEASONS),
    daytime: vote.daytime && vote.daytime in DAYTIME ? vote.daytime : null,
    occasions: vote.occasions.filter((o) => o in OCCASIONS),
    updated_at: new Date().toISOString(),
  };
  const { error } = await ctx.sb.from("review_votes").upsert(clean, { onConflict: "user_id,perfume_id" });
  if (error) return { ok: false, error: "No pudimos guardar tu voto." };
  revalidatePath(`/perfumes/${slug}`);
  return { ok: true, message: "¡Gracias! Tu voto ya cuenta." };
}

export async function toggleFavorite(perfumeId: string): Promise<ActionResult<{ favorite: boolean }>> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb, user } = ctx;
  const { data: existing } = await sb
    .from("favorites")
    .select("perfume_id")
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId)
    .maybeSingle();
  const { error } = existing
    ? await sb.from("favorites").delete().eq("user_id", user.id).eq("perfume_id", perfumeId)
    : await sb.from("favorites").insert({ user_id: user.id, perfume_id: perfumeId });
  if (error) return { ok: false, error: "No pudimos actualizar tus favoritos." };
  revalidatePath("/coleccion");
  return { ok: true, data: { favorite: !existing }, message: existing ? "Quitado de favoritos." : "Añadido a favoritos." };
}

export async function setCollectionStatus(perfumeId: string, status: CollectionStatus | null): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb, user } = ctx;
  if (status && !STATUSES.includes(status)) return { ok: false, error: "Estado no válido." };
  const { error } = status
    ? await sb
        .from("collection_items")
        .upsert(
          { user_id: user.id, perfume_id: perfumeId, status, updated_at: new Date().toISOString() },
          { onConflict: "user_id,perfume_id" },
        )
    : await sb.from("collection_items").delete().eq("user_id", user.id).eq("perfume_id", perfumeId);
  if (error) return { ok: false, error: "No pudimos actualizar tu colección." };
  revalidatePath("/coleccion");
  return { ok: true, message: status ? "Colección actualizada." : "Quitado de tu colección." };
}
