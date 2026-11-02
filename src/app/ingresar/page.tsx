import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { Reveal } from "@/components/motion/Reveal";
import { BottleArt } from "@/components/perfume/BottleArt";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Iniciar sesión o registrarse", robots: { index: false } };

const ERRORS: Record<string, string> = {
  config: "La autenticación todavía no está configurada.",
  google: "No pudimos iniciar sesión con Google. Revisá que el proveedor esté activo en Supabase.",
  callback: "El enlace expiró o no es válido. Volvé a intentarlo.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; modo?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="container-editorial pt-6">
      <div className="grid overflow-hidden rounded-3xl border border-line lg:grid-cols-2">
        <div className="grain relative hidden flex-col justify-between bg-ivory p-12 lg:flex">
          <div>
            <p className="eyebrow">Comunidad Reseñarte</p>
            <h1 className="mt-4 text-6xl leading-[0.98]">
              Tu diario <em className="text-forest">olfativo</em> empieza acá.
            </h1>
            <p className="mt-5 max-w-sm text-muted">Guardá favoritos, armá tu estantería y compartí lo que sentís con cada perfume.</p>
          </div>
          <div className="relative mx-auto h-72 w-full">
            <BottleArt seed="login-a" family="floral" brand="R" variant={1} className="absolute bottom-0 left-[12%] h-48" />
            <BottleArt seed="login-b" family="amaderada" brand="R" variant={0} className="absolute bottom-0 left-1/2 h-72 -translate-x-1/2" />
            <BottleArt seed="login-c" family="citrica" brand="R" variant={3} className="absolute right-[12%] bottom-0 h-44" />
          </div>
        </div>

        <div className="p-6 sm:p-12">
          <Reveal className="mx-auto max-w-sm">
            <h2 className="mb-2 text-4xl lg:hidden">Accedé a Reseñarte</h2>
            <p className="mb-8 text-sm text-muted lg:mt-6">Ingresá o creá tu cuenta gratis.</p>
            {sp.error && <p role="alert" className="mb-6 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{ERRORS[sp.error] ?? ERRORS.callback}</p>}
            {isSupabaseConfigured() ? (
              <AuthForm next={next} initialMode={sp.modo === "registro" ? "registro" : "login"} />
            ) : (
              <p className="rounded-xl bg-ivory p-5 text-sm text-chocolate">
                El registro y el inicio de sesión se activan al configurar Supabase. Encontrás los pasos en el README del proyecto.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
