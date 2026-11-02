import "server-only";
import { createClient } from "@/lib/supabase/server";
import { IMAGE_LIMITS } from "@/lib/constants";

export const NOT_CONFIGURED = "La base de datos todavía no está conectada. Configurá Supabase (ver README) para activar esta función.";
export const LOGIN_REQUIRED = "Necesitás iniciar sesión para hacer esto.";

export async function getContext() {
  const sb = await createClient();
  if (!sb) return { error: NOT_CONFIGURED } as const;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: LOGIN_REQUIRED } as const;
  const { data: profile } = await sb.from("profiles").select("role, is_banned, username").eq("id", user.id).maybeSingle();
  if (profile?.is_banned) return { error: "Tu cuenta está suspendida. Contactá a moderación." } as const;
  return { sb, user, role: (profile?.role as string) ?? "user", username: profile?.username as string | undefined };
}

export function validateImage(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!IMAGE_LIMITS.types.includes(file.type)) return "Formato no admitido. Usá JPG, PNG o WebP.";
  if (file.size > IMAGE_LIMITS.maxBytes) return "La imagen supera los 5 MB.";
  return null;
}

export const extFor = (type: string) => (type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg");
