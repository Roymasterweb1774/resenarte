import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };

const LINKS = [
  { href: "/admin", label: "Resumen", admin: false },
  { href: "/admin/perfumes", label: "Perfumes", admin: true },
  { href: "/admin/catalogo", label: "Marcas, familias, notas y acordes", admin: true },
  { href: "/admin/reportes", label: "Reseñas reportadas", admin: false },
  { href: "/admin/usuarios", label: "Usuarios", admin: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-editorial max-w-2xl pt-10">
        <h1 className="text-5xl">Panel de administración</h1>
        <p className="mt-4 text-muted">El panel requiere Supabase configurado y un usuario con rol <code>admin</code>. Ver README.</p>
      </div>
    );
  }
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/admin");
  const role = user.profile?.role;
  if (role !== "admin" && role !== "moderator") redirect("/");

  return (
    <div className="container-editorial pt-6">
      <div className="grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside>
          <p className="eyebrow mb-4">Panel · {role === "admin" ? "Administración" : "Moderación"}</p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {LINKS.filter((l) => role === "admin" || !l.admin).map((l) => (
              <Link key={l.href} href={l.href} className="shrink-0 rounded-lg px-3 py-2 text-sm hover:bg-ivory hover:text-forest">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
