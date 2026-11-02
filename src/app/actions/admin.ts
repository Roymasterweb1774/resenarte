"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CONCENTRATIONS } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { extFor, getContext, validateImage } from "./_shared";

async function requireRole(level: "admin" | "moderator") {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error! } as const;
  const allowed = level === "admin" ? ctx.role === "admin" : ["admin", "moderator"].includes(ctx.role);
  if (!allowed) return { error: "No tenés permisos para esta acción." } as const;
  return ctx;
}

const parseList = (v: FormDataEntryValue | null): string[] => {
  try {
    const arr = JSON.parse(String(v ?? "[]"));
    return Array.isArray(arr) ? [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))] : [];
  } catch {
    return [];
  }
};

/** Busca por slug o crea notas/acordes que no existan todavía. */
async function resolveIds(sb: any, table: "notes" | "accords", names: string[]) {
  if (!names.length) return new Map<string, string>();
  const slugs = names.map(slugify);
  const { data: existing } = await sb.from(table).select("id, slug").in("slug", slugs);
  const map = new Map<string, string>((existing ?? []).map((r: any) => [r.slug, r.id]));
  const missing = names.filter((n) => !map.has(slugify(n))).map((n) => ({ slug: slugify(n), name: n }));
  if (missing.length) {
    const { data: created } = await sb.from(table).insert(missing).select("id, slug");
    (created ?? []).forEach((r: any) => map.set(r.slug, r.id));
  }
  return map;
}

export async function savePerfume(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { sb } = ctx;

  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const brandId = String(formData.get("brand_id") ?? "");
  const familyId = String(formData.get("family_id") ?? "") || null;
  const concentration = String(formData.get("concentration") ?? "") || null;
  const gender = String(formData.get("gender") ?? "") || null;
  const yearRaw = String(formData.get("release_year") ?? "").trim();
  const releaseYear = yearRaw ? Number(yearRaw) : null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageCredit = String(formData.get("image_credit") ?? "").trim() || null;
  const image = formData.get("image") as File | null;
  const removeImage = formData.get("remove_image") === "on";

  const fieldErrors: Record<string, string> = {};
  if (name.length < 1) fieldErrors.name = "El nombre es obligatorio.";
  if (!brandId) fieldErrors.brand_id = "Elegí una marca.";
  if (concentration && !CONCENTRATIONS.includes(concentration)) fieldErrors.concentration = "Concentración no válida.";
  if (gender && !["femenino", "masculino", "unisex"].includes(gender)) fieldErrors.gender = "Valor no válido.";
  if (releaseYear !== null && (!Number.isInteger(releaseYear) || releaseYear < 1700 || releaseYear > 2100))
    fieldErrors.release_year = "Año no válido.";
  const imgErr = validateImage(image);
  if (imgErr) fieldErrors.image = imgErr;
  if (image && image.size > 0 && !imageCredit) fieldErrors.image_credit = "Indicá la fuente y licencia de la imagen.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Revisá los campos marcados.", fieldErrors };

  const row: Record<string, unknown> = {
    name,
    slug,
    brand_id: brandId,
    family_id: familyId,
    concentration,
    gender,
    release_year: releaseYear,
    description,
    image_credit: imageCredit,
    updated_at: new Date().toISOString(),
  };
  if (removeImage) row.image_url = null;

  if (image && image.size > 0) {
    const path = `${slug}-${Date.now()}.${extFor(image.type)}`;
    const { error } = await sb.storage.from("perfume-images").upload(path, image, { contentType: image.type });
    if (error) return { ok: false, error: "No pudimos subir la imagen." };
    row.image_url = sb.storage.from("perfume-images").getPublicUrl(path).data.publicUrl;
  }

  const result = id
    ? await sb.from("perfumes").update(row).eq("id", id).select("id").single()
    : await sb.from("perfumes").insert(row).select("id").single();
  if (result.error) {
    if (result.error.code === "23505") return { ok: false, error: "Ya existe un perfume con ese slug.", fieldErrors: { slug: "En uso." } };
    return { ok: false, error: `No pudimos guardar el perfume: ${result.error.message}` };
  }
  const perfumeId = result.data.id as string;

  // Notas por capa
  const layers = { salida: parseList(formData.get("notes_salida")), corazon: parseList(formData.get("notes_corazon")), fondo: parseList(formData.get("notes_fondo")) };
  const noteIds = await resolveIds(sb, "notes", Object.values(layers).flat());
  await sb.from("perfume_notes").delete().eq("perfume_id", perfumeId);
  const noteRows = Object.entries(layers).flatMap(([layer, names]) =>
    names.map((n, position) => ({ perfume_id: perfumeId, note_id: noteIds.get(slugify(n)), layer, position })).filter((r) => r.note_id),
  );
  if (noteRows.length) await sb.from("perfume_notes").insert(noteRows);

  // Acordes, por orden de dominancia
  const accords = parseList(formData.get("accords"));
  const accordIds = await resolveIds(sb, "accords", accords);
  await sb.from("perfume_accords").delete().eq("perfume_id", perfumeId);
  const accordRows = accords
    .map((a, i) => ({ perfume_id: perfumeId, accord_id: accordIds.get(slugify(a)), intensity: Math.max(30, 100 - i * 14) }))
    .filter((r) => r.accord_id);
  if (accordRows.length) await sb.from("perfume_accords").insert(accordRows);

  revalidatePath("/", "layout");
  redirect(`/admin/perfumes?guardado=${slug}`);
}

export async function deletePerfume(id: string): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { error } = await ctx.sb.from("perfumes").delete().eq("id", id);
  if (error) return { ok: false, error: "No pudimos eliminar el perfume." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Perfume eliminado." };
}

export async function saveBrand(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  const row = {
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    description: String(formData.get("description") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    logo_credit: String(formData.get("logo_credit") ?? "").trim() || null,
  };
  const { error } = id ? await ctx.sb.from("brands").update(row).eq("id", id) : await ctx.sb.from("brands").insert(row);
  if (error) return { ok: false, error: error.code === "23505" ? "Ya existe una marca con ese slug." : "No pudimos guardar la marca." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Marca guardada." };
}

const SIMPLE_TABLES = ["brands", "families", "notes", "accords"] as const;
type SimpleTable = (typeof SIMPLE_TABLES)[number];

export async function saveSimple(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const table = String(formData.get("table")) as SimpleTable;
  if (!["families", "notes", "accords"].includes(table)) return { ok: false, error: "Tabla no válida." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  const row: Record<string, unknown> = { name, slug: slugify(name) };
  if (table === "families") row.description = String(formData.get("description") ?? "").trim() || null;
  if (table === "accords") row.color = String(formData.get("color") ?? "#8A9B7A");
  const { error } = await ctx.sb.from(table).insert(row);
  if (error) return { ok: false, error: error.code === "23505" ? "Ya existe un elemento con ese nombre." : "No pudimos guardar." };
  revalidatePath("/admin/catalogo");
  return { ok: true, message: "Guardado." };
}

export async function deleteSimple(table: SimpleTable, id: string): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  if (!SIMPLE_TABLES.includes(table)) return { ok: false, error: "Tabla no válida." };
  const { error } = await ctx.sb.from(table).delete().eq("id", id);
  if (error)
    return {
      ok: false,
      error: error.code === "23503" ? "No se puede eliminar: hay perfumes que lo usan." : "No pudimos eliminar.",
    };
  revalidatePath("/", "layout");
  return { ok: true, message: "Eliminado." };
}

export async function moderateReview(reviewId: string, status: "published" | "hidden", note?: string): Promise<ActionResult> {
  const ctx = await requireRole("moderator");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { error } = await ctx.sb.from("reviews").update({ status, moderation_note: note ?? null }).eq("id", reviewId);
  if (error) return { ok: false, error: "No pudimos moderar la reseña." };
  if (status === "hidden") {
    await ctx.sb
      .from("review_reports")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("review_id", reviewId)
      .eq("status", "open");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: status === "hidden" ? "Reseña ocultada." : "Reseña restaurada." };
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<ActionResult> {
  const ctx = await requireRole("moderator");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  const { error } = await ctx.sb
    .from("review_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) return { ok: false, error: "No pudimos actualizar el reporte." };
  revalidatePath("/admin/reportes");
  return { ok: true, message: "Reporte actualizado." };
}

export async function updateUser(userId: string, patch: { role?: string; is_banned?: boolean }): Promise<ActionResult> {
  const ctx = await requireRole("admin");
  if ("error" in ctx) return { ok: false, error: ctx.error! };
  if (userId === ctx.user.id) return { ok: false, error: "No podés modificar tu propio rol o estado." };
  if (patch.role && !["user", "moderator", "admin"].includes(patch.role)) return { ok: false, error: "Rol no válido." };
  const { error } = await ctx.sb.from("profiles").update(patch).eq("id", userId);
  if (error) return { ok: false, error: "No pudimos actualizar el usuario." };
  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Usuario actualizado." };
}
