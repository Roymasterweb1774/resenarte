// ---------------------------------------------------------------------------
// CATÁLOGO INICIAL (src/data/catalog.json)
// Perfumes reales usados cuando Supabase no está configurado. El mismo archivo
// genera supabase/seed.sql (npm run seed:sql). No contiene reseñas ni
// valoraciones: esas solo existen cuando las publican usuarios reales.
// ---------------------------------------------------------------------------
import catalog from "@/data/catalog.json";
import type { Accord, Brand, Family, Note, NoteLayer, Perfume } from "./types";
import { slugify } from "./utils";

type RawPerfume = {
  name: string;
  brand: string;
  family: string;
  concentration: string | null;
  gender: string | null;
  year: number | null;
  description: string | null;
  image: string | null;
  image_credit: string | null;
  notes: Record<NoteLayer, string[]>;
  accords: string[];
};

const RAW = catalog.perfumes as RawPerfume[];

/** Slug de un perfume: marca + nombre, p. ej. "chanel-n5". */
export const perfumeSlug = (p: { brand: string; name: string }) => slugify(`${p.brand} ${p.name.replace("°", "")}`);

export const DEMO_FAMILIES: Family[] = catalog.families.map(([slug, name, description], i) => ({
  id: slug,
  slug,
  name,
  description,
  position: i,
}));

export const DEMO_ACCORDS: Accord[] = catalog.accords.map(([name, color]) => ({ id: slugify(name), slug: slugify(name), name, color }));

export const DEMO_BRANDS: Brand[] = catalog.brands.map(([name, country]) => ({
  id: slugify(name),
  slug: slugify(name),
  name,
  description: null,
  country,
  logo_url: null,
  logo_credit: null,
  is_demo: false,
}));

const noteNames = [...new Set(RAW.flatMap((p) => Object.values(p.notes).flat()))];
export const DEMO_NOTES: Note[] = noteNames
  .map((name) => ({ id: slugify(name), slug: slugify(name), name, image_url: null }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

const find = <T extends { name: string }>(list: T[], name: string) => {
  const found = list.find((x) => x.name === name);
  if (!found) throw new Error(`Catálogo: no existe "${name}"`);
  return found;
};

export const DEMO_PERFUMES: Perfume[] = RAW.map((p, i) => ({
  id: perfumeSlug(p),
  slug: perfumeSlug(p),
  name: p.name,
  brand: find(DEMO_BRANDS, p.brand),
  family: DEMO_FAMILIES.find((f) => f.slug === p.family) ?? null,
  concentration: p.concentration,
  gender: p.gender as Perfume["gender"],
  release_year: p.year,
  description: p.description,
  image_url: p.image,
  image_credit: p.image_credit,
  gallery: [],
  rating_avg: null,
  review_count: 0,
  favorites_count: 0,
  is_demo: false,
  created_at: new Date(Date.UTC(2025, 0, 1 + i)).toISOString(),
  notes: (Object.keys(p.notes) as NoteLayer[]).flatMap((layer) =>
    p.notes[layer].map((n, position) => ({ layer, position, note: find(DEMO_NOTES, n) })),
  ),
  accords: p.accords.map((a, idx) => ({ intensity: Math.max(30, 100 - idx * 14), accord: find(DEMO_ACCORDS, a) })),
}));
