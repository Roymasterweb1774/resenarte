import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getAdminStats } from "@/lib/data";

const LABELS: [string, string, string?][] = [
  ["perfumes", "Perfumes", "/admin/perfumes"],
  ["brands", "Marcas", "/admin/catalogo"],
  ["reviews", "Reseñas publicadas"],
  ["reviews_7d", "Reseñas (7 días)"],
  ["hidden_reviews", "Reseñas ocultas", "/admin/reportes"],
  ["open_reports", "Reportes abiertos", "/admin/reportes"],
  ["users", "Usuarios", "/admin/usuarios"],
];

export default async function AdminHome() {
  const stats = await getAdminStats();
  return (
    <div>
      <h1 className="text-5xl">Resumen</h1>
      <p className="mt-2 text-sm text-muted">Estadísticas básicas calculadas en tiempo real desde la base de datos.</p>
      {stats ? (
        <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {LABELS.map(([k, label, href]) => {
            const card = (
              <div className="rounded-2xl border border-line p-6 transition-colors hover:border-sage">
                <p className="font-serif text-5xl text-forest">{stats[k] ?? 0}</p>
                <p className="mt-2 text-sm text-muted">{label}</p>
              </div>
            );
            return <StaggerItem key={k}>{href ? <Link href={href}>{card}</Link> : card}</StaggerItem>;
          })}
        </Stagger>
      ) : (
        <p className="mt-8 text-sm text-danger">No pudimos cargar las estadísticas. ¿Ejecutaste la migración SQL?</p>
      )}
    </div>
  );
}
