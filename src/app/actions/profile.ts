"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { extFor, getContext, validateImage } from "./_shared";

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb, user } = ctx;

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatar = formData.get("avatar") as File | null;

  const fieldErrors: Record<string, string> = {};
  if (!/^[a-z0-9_]{3,30}$/.test(username)) fieldErrors.username = "Entre 3 y 30 caracteres: letras, números o guion bajo.";
  if (displayName.length < 1 || displayName.length > 60) fieldErrors.display_name = "Entre 1 y 60 caracteres.";
  if (bio.length > 300) fieldErrors.bio = "Máximo 300 caracteres.";
  const imgError = validateImage(avatar);
  if (imgError) fieldErrors.avatar = imgError;
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Revisá los campos marcados.", fieldErrors };

  const update: Record<string, unknown> = {
    username,
    display_name: displayName,
    bio: bio || null,
    show_favorites: formData.get("show_favorites") === "on",
    show_collection: formData.get("show_collection") === "on",
  };

  if (avatar && avatar.size > 0) {
    const path = `${user.id}/avatar-${Date.now()}.${extFor(avatar.type)}`;
    const { error: upErr } = await sb.storage.from("avatars").upload(path, avatar, { contentType: avatar.type });
    if (upErr) return { ok: false, error: "No pudimos subir el avatar." };
    update.avatar_url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await sb.from("profiles").update(update).eq("id", user.id);
  if (error?.code === "23505") return { ok: false, error: "Ese nombre de usuario ya está en uso.", fieldErrors: { username: "No disponible." } };
  if (error) return { ok: false, error: "No pudimos guardar los cambios." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfil actualizado." };
}

export async function deleteAccount(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await getContext();
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "ELIMINAR")
    return { ok: false, error: "Escribí ELIMINAR para confirmar." };
  const admin = createAdminClient();
  if (!admin)
    return {
      ok: false,
      error: "La eliminación de cuentas requiere configurar SUPABASE_SERVICE_ROLE_KEY en el servidor (ver README).",
    };
  const { error } = await admin.auth.admin.deleteUser(ctx.user.id);
  if (error) return { ok: false, error: "No pudimos eliminar la cuenta. Intentá más tarde." };
  await ctx.sb.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?cuenta=eliminada");
}
