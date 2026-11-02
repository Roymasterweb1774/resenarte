"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { NOT_CONFIGURED } from "./_shared";

const translate = (msg: string) => {
  if (/invalid login credentials/i.test(msg)) return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg)) return "Tenés que confirmar tu email antes de ingresar. Revisá tu bandeja de entrada.";
  if (/already registered/i.test(msg)) return "Ya existe una cuenta con ese email.";
  if (/password should be/i.test(msg)) return "La contraseña debe tener al menos 8 caracteres.";
  if (/rate limit/i.test(msg)) return "Demasiados intentos. Esperá unos minutos y volvé a probar.";
  return "No pudimos completar la operación. Intentá nuevamente.";
};

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const sb = await createClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Completá email y contraseña." };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: translate(error.message) };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const sb = await createClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED };
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Ingresá tu nombre público.";
  if (!/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = "Ingresá un email válido.";
  if (password.length < 8) fieldErrors.password = "Mínimo 8 caracteres.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Revisá los campos marcados.", fieldErrors };

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: translate(error.message) };
  revalidatePath("/", "layout");
  if (!data.session) {
    return { ok: true, message: "¡Cuenta creada! Te enviamos un email para confirmar tu dirección." };
  }
  return { ok: true };
}

export async function signInWithGoogle(formData: FormData) {
  const sb = await createClient();
  if (!sb) redirect("/ingresar?error=config");
  const next = safeNext(String(formData.get("next") ?? "/"));
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/ingresar?error=google");
  redirect(data.url);
}

export async function signOut() {
  const sb = await createClient();
  await sb?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
