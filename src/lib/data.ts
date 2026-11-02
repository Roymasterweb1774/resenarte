import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { DEMO_ACCORDS, DEMO_BRANDS, DEMO_FAMILIES, DEMO_NOTES, DEMO_PERFUMES } from "./demo-data";
import type {
  Accord,
  Brand,
  CollectionStatus,
  CurrentUser,
  Family,
  Note,
  Perfume,
  Profile,
  Review,
  VoteRow,
  VoteStats,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const LAYER_ORDER = { salida: 0, corazon: 1, fondo: 2 } as const;

const PERFUME_SELECT = `
  id, slug, name, concentration, gender, release_year, description, image_url, image_credit, gallery,
  rating_avg, review_count, favorites_count, is_demo, created_at,
  brand:brands(*), family:families(*),
  perfume_notes(layer, position, note:notes(id, slug, name, image_url)),
  perfume_accords(intensity, accord:accords(id, slug, name, color))
`;

const REVIEW_SELECT = `
  id, perfume_id, user_id, rating, title, body, longevity, sillage, would_rebuy, tried_via, photo_url,
  status, created_at, updated_at, edited_at,
  author:profiles(id, username, display_name, avatar_url),
  helpful:review_helpful_votes(count),
  perfume:perfumes(slug, name, brand:brands(name))
`;

function mapPerfume(row: any): Perfume {
  return {
    ...row,
    rating_avg: row.rating_avg == null ? null : Number(row.rating_avg),
    gallery: row.gallery ?? [],
    notes: (row.perfume_notes ?? [])
      .filter((n: any) => n.note)
      .sort(
        (a: any, b: any) =>
          LAYER_ORDER[a.layer as keyof typeof LAYER_ORDER] - LAYER_ORDER[b.layer as keyof typeof LAYER_ORDER] ||
          a.position - b.position,
      ),
    accords: (row.perfume_accords ?? []).filter((a: any) => a.accord).sort((a: any, b: any) => b.intensity - a.intensity),
  };
}

function mapReview(row: any, helpfulByViewer: Set<string>): Review {
  return {
    ...row,
    helpful_count: row.helpful?.[0]?.count ?? 0,
    viewer_found_helpful: helpfulByViewer.has(row.id),
    author: row.author ?? null,
    perfume: row.perfume ? { slug: row.perfume.slug, name: row.perfume.name, brand_name: row.perfume.brand?.name ?? "" } : null,
  };
}

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const sb = await createClient();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? null, profile: (profile as Profile) ?? null };
});

/* ------------------------------------------------------------------ */
/* Catálogo                                                            */
/* ------------------------------------------------------------------ */

export const getAllPerfumes = cache(async (): Promise<Perfume[]> => {
  const sb = await createClient();
  if (!sb) return DEMO_PERFUMES;
  const { data, error } = await sb.from("perfumes").select(PERFUME_SELECT).order("name");
  if (error) {
    console.error("getAllPerfumes", error.message);
    return [];
  }
  return (data ?? []).map(mapPerfume);
});

export const getPerfumeBySlug = cache(async (slug: string): Promise<Perfume | null> => {
  const sb = await createClient();
  if (!sb) return DEMO_PERFUMES.find((p) => p.slug === slug) ?? null;
  const { data } = await sb.from("perfumes").select(PERFUME_SELECT).eq("slug", slug).maybeSingle();
  return data ? mapPerfume(data) : null;
});

export const getPerfumeById = async (id: string): Promise<Perfume | null> => {
  const sb = await createClient();
  if (!sb) return DEMO_PERFUMES.find((p) => p.id === id) ?? null;
  const { data } = await sb.from("perfumes").select(PERFUME_SELECT).eq("id", id).maybeSingle();
  return data ? mapPerfume(data) : null;
};

export const getFamilies = cache(async (): Promise<Family[]> => {
  const sb = await createClient();
  if (!sb) return DEMO_FAMILIES;
  const { data } = await sb.from("families").select("*").order("position");
  return (data as Family[]) ?? [];
});

export const getBrands = cache(async (): Promise<(Brand & { perfume_count: number })[]> => {
  const sb = await createClient();
  const perfumes = await getAllPerfumes();
  const counts = new Map<string, number>();
  perfumes.forEach((p) => counts.set(p.brand.id, (counts.get(p.brand.id) ?? 0) + 1));
  let brands: Brand[] = DEMO_BRANDS;
  if (sb) {
    const { data } = await sb.from("brands").select("*").order("name");
    brands = (data as Brand[]) ?? [];
  }
  return brands
    .map((b) => ({ ...b, perfume_count: counts.get(b.id) ?? 0 }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
});

export const getBrandBySlug = async (slug: string) => {
  const brands = await getBrands();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) return null;
  const perfumes = (await getAllPerfumes()).filter((p) => p.brand.id === brand.id);
  return { brand, perfumes };
};

export const getNotes = async (): Promise<Note[]> => {
  const sb = await createClient();
  if (!sb) return DEMO_NOTES;
  const { data } = await sb.from("notes").select("*").order("name");
  return (data as Note[]) ?? [];
};

export const getAccords = async (): Promise<Accord[]> => {
  const sb = await createClient();
  if (!sb) return DEMO_ACCORDS;
  const { data } = await sb.from("accords").select("*").order("name");
  return (data as Accord[]) ?? [];
};

/** Similitud por notas, acordes y familia registrados (sin IA). */
export function getSimilar(perfume: Perfume, all: Perfume[], limit = 4): Perfume[] {
  const notes = new Set(perfume.notes.map((n) => n.note.id));
  const accords = new Map(perfume.accords.map((a) => [a.accord.id, a.intensity]));
  return all
    .filter((p) => p.id !== perfume.id)
    .map((p) => {
      let score = 0;
      p.notes.forEach((n) => notes.has(n.note.id) && (score += 2));
      p.accords.forEach((a) => {
        const mine = accords.get(a.accord.id);
        if (mine) score += 1 + Math.min(mine, a.intensity) / 40;
      });
      if (perfume.family && p.family?.id === perfume.family.id) score += 4;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export async function getTrending(limit = 4) {
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb.rpc("trending_perfumes", { lim: limit });
  if (error || !data?.length) return [];
  const all = await getAllPerfumes();
  return (data as any[])
    .map((row) => {
      const perfume = all.find((p) => p.id === row.perfume_id);
      return perfume
        ? { perfume, reviews: row.reviews_30d as number, favorites: row.favorites_30d as number, collection: row.collection_30d as number }
        : null;
    })
    .filter(Boolean) as { perfume: Perfume; reviews: number; favorites: number; collection: number }[];
}

/* ------------------------------------------------------------------ */
/* Reseñas                                                             */
/* ------------------------------------------------------------------ */

async function helpfulSet(sb: any, viewerId: string | undefined, ids: string[]) {
  if (!viewerId || !ids.length) return new Set<string>();
  const { data } = await sb.from("review_helpful_votes").select("review_id").eq("user_id", viewerId).in("review_id", ids);
  return new Set<string>((data ?? []).map((r: any) => r.review_id));
}

export async function getReviewsForPerfume(perfumeId: string, viewerId?: string): Promise<Review[]> {
  const sb = await createClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("perfume_id", perfumeId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getReviewsForPerfume", error.message);
    return [];
  }
  const rows = (data ?? []).filter((r: any) => r.status === "published" || r.user_id === viewerId);
  const helpful = await helpfulSet(sb, viewerId, rows.map((r: any) => r.id));
  return rows.map((r) => mapReview(r, helpful));
}

export async function getLatestReviews(limit = 6, offset = 0, viewerId?: string) {
  const sb = await createClient();
  if (!sb) return { reviews: [] as Review[], total: 0 };
  const { data, count, error } = await sb
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("getLatestReviews", error.message);
    return { reviews: [] as Review[], total: 0 };
  }
  const helpful = await helpfulSet(sb, viewerId, (data ?? []).map((r: any) => r.id));
  return { reviews: (data ?? []).map((r) => mapReview(r, helpful)), total: count ?? 0 };
}

export async function getReviewsByUser(userId: string, viewerId?: string) {
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("user_id", userId)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const helpful = await helpfulSet(sb, viewerId, (data ?? []).map((r: any) => r.id));
  return (data ?? []).map((r) => mapReview(r, helpful));
}

export async function getOwnReview(perfumeId: string, userId: string): Promise<Review | null> {
  const sb = await createClient();
  if (!sb) return null;
  const { data } = await sb.from("reviews").select(REVIEW_SELECT).eq("perfume_id", perfumeId).eq("user_id", userId).maybeSingle();
  return data ? mapReview(data, new Set()) : null;
}

/* ------------------------------------------------------------------ */
/* Votos de la comunidad                                               */
/* ------------------------------------------------------------------ */

export async function getVoteStats(perfumeId: string, viewerId?: string) {
  const empty: VoteStats = { total: 0, longevity: [0, 0, 0, 0, 0], sillage: [0, 0, 0, 0], seasons: {}, daytime: {}, occasions: {} };
  const sb = await createClient();
  if (!sb) return { stats: empty, mine: null as VoteRow | null };
  const { data } = await sb.from("review_votes").select("user_id, longevity, sillage, seasons, daytime, occasions").eq("perfume_id", perfumeId);
  const stats = structuredClone(empty);
  let mine: VoteRow | null = null;
  for (const v of (data ?? []) as (VoteRow & { user_id: string })[]) {
    stats.total++;
    if (v.longevity) stats.longevity[v.longevity - 1]++;
    if (v.sillage) stats.sillage[v.sillage - 1]++;
    v.seasons?.forEach((s) => (stats.seasons[s] = (stats.seasons[s] ?? 0) + 1));
    if (v.daytime) stats.daytime[v.daytime] = (stats.daytime[v.daytime] ?? 0) + 1;
    v.occasions?.forEach((o) => (stats.occasions[o] = (stats.occasions[o] ?? 0) + 1));
    if (v.user_id === viewerId) mine = v;
  }
  return { stats, mine };
}

/* ------------------------------------------------------------------ */
/* Favoritos y colección                                               */
/* ------------------------------------------------------------------ */

export async function getUserShelf(userId: string) {
  const sb = await createClient();
  if (!sb) return { favorites: [] as string[], collection: [] as { perfume_id: string; status: CollectionStatus }[] };
  const [fav, col] = await Promise.all([
    sb.from("favorites").select("perfume_id").eq("user_id", userId).order("created_at", { ascending: false }),
    sb.from("collection_items").select("perfume_id, status").eq("user_id", userId).order("updated_at", { ascending: false }),
  ]);
  return {
    favorites: (fav.data ?? []).map((f: any) => f.perfume_id as string),
    collection: (col.data ?? []) as { perfume_id: string; status: CollectionStatus }[],
  };
}

export async function getPerfumeShelfState(perfumeId: string, userId?: string) {
  const sb = await createClient();
  if (!sb || !userId) return { favorite: false, status: null as CollectionStatus | null };
  const [fav, col] = await Promise.all([
    sb.from("favorites").select("perfume_id").eq("user_id", userId).eq("perfume_id", perfumeId).maybeSingle(),
    sb.from("collection_items").select("status").eq("user_id", userId).eq("perfume_id", perfumeId).maybeSingle(),
  ]);
  return { favorite: !!fav.data, status: (col.data?.status as CollectionStatus) ?? null };
}

/* ------------------------------------------------------------------ */
/* Perfiles                                                            */
/* ------------------------------------------------------------------ */

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const sb = await createClient();
  if (!sb) return null;
  const { data } = await sb.from("profiles").select("*").eq("username", username).maybeSingle();
  return (data as Profile) ?? null;
}

/* ------------------------------------------------------------------ */
/* Administración                                                      */
/* ------------------------------------------------------------------ */

export async function getAdminStats() {
  const sb = await createClient();
  if (!sb) return null;
  const { data, error } = await sb.rpc("admin_stats");
  if (error) return null;
  return data as Record<string, number>;
}

export async function getReports(status = "open") {
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb
    .from("review_reports")
    .select(
      `id, reason, status, created_at,
       reporter:profiles(username, display_name),
       review:reviews(id, title, body, rating, status, user_id, perfume:perfumes(slug, name), author:profiles(username, display_name))`,
    )
    .eq("status", status)
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}

export async function getUsersForAdmin(query = "") {
  const sb = await createClient();
  if (!sb) return [];
  let q = sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
  if (query) q = q.or(`username.ilike.%${query.replace(/[%,()]/g, "")}%,display_name.ilike.%${query.replace(/[%,()]/g, "")}%`);
  const { data } = await q;
  return (data as Profile[]) ?? [];
}

export async function getHiddenReviews() {
  const sb = await createClient();
  if (!sb) return [];
  const { data } = await sb.from("reviews").select(REVIEW_SELECT).eq("status", "hidden").order("updated_at", { ascending: false });
  return (data ?? []).map((r) => mapReview(r, new Set()));
}
