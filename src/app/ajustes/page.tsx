import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountForm, ProfileForm } from "@/components/auth/SettingsForms";
import { Reveal } from "@/components/motion/Reveal";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Ajustes", robots: { index: false } };

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) redirect("/ingresar?error=config");
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/ingresar?next=/ajustes");

  return (
    <div className="container-editorial max-w-3xl pt-8">
      <Reveal>
        <Link href={`/perfil/${user.profile.username}`} className="text-xs text-muted hover:text-forest">← Ver mi perfil público</Link>
        <h1 className="mt-4 text-5xl sm:text-6xl">
          Ajustes y <em className="text-forest">privacidad</em>
        </h1>
        <p className="mt-3 text-sm text-muted">Cuenta: {user.email}</p>
      </Reveal>

      <section className="mt-12 rounded-3xl border border-line p-6 sm:p-10">
        <h2 className="mb-8 text-3xl">Perfil</h2>
        <ProfileForm profile={user.profile} />
      </section>

      <section className="mt-10 rounded-3xl border border-danger/20 p-6 sm:p-10">
        <h2 className="mb-4 text-3xl text-danger">Eliminar cuenta</h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
