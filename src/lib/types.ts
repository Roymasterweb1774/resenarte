export type Gender = "femenino" | "masculino" | "unisex";
export type NoteLayer = "salida" | "corazon" | "fondo";
export type Role = "user" | "moderator" | "admin";
export type CollectionStatus = "tengo" | "tuve" | "quiero" | "probando";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  country: string | null;
  logo_url: string | null;
  logo_credit: string | null;
  is_demo: boolean;
}

export interface Family {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
}

export interface Note {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
}

export interface Accord {
  id: string;
  slug: string;
  name: string;
  color: string | null;
}

export interface PerfumeNote {
  layer: NoteLayer;
  position: number;
  note: Note;
}

export interface PerfumeAccord {
  intensity: number;
  accord: Accord;
}

export interface Perfume {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  family: Family | null;
  concentration: string | null;
  gender: Gender | null;
  release_year: number | null;
  description: string | null;
  image_url: string | null;
  image_credit: string | null;
  gallery: string[];
  rating_avg: number | null;
  review_count: number;
  favorites_count: number;
  is_demo: boolean;
  created_at: string;
  notes: PerfumeNote[];
  accords: PerfumeAccord[];
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  is_banned: boolean;
  show_favorites: boolean;
  show_collection: boolean;
  created_at: string;
}

export type ProfileLite = Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;

export interface Review {
  id: string;
  perfume_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  longevity: number | null;
  sillage: number | null;
  would_rebuy: "si" | "no" | "no_seguro" | null;
  tried_via: "frasco" | "decant" | "tienda" | "prestado" | null;
  photo_url: string | null;
  status: "published" | "hidden";
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  helpful_count: number;
  viewer_found_helpful: boolean;
  author: ProfileLite | null;
  perfume?: { slug: string; name: string; brand_name: string } | null;
}

export interface VoteRow {
  longevity: number | null;
  sillage: number | null;
  seasons: string[];
  daytime: string | null;
  occasions: string[];
}

export interface VoteStats {
  total: number;
  longevity: number[];
  sillage: number[];
  seasons: Record<string, number>;
  daytime: Record<string, number>;
  occasions: Record<string, number>;
}

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
