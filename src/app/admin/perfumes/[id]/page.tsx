import Link from "next/link";
import { notFound } from "next/navigation";
import { PerfumeForm } from "@/components/admin/PerfumeForm";
import { getAccords, getBrands, getFamilies, getNotes, getPerfumeById } from "@/lib/data";

/** /admin/perfumes/nuevo crea; /admin/perfumes/<id> edita. */
export default async function EditPerfume({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nuevo";
  const [perfume, brands, families, notes, accords] = await Promise.all([
    isNew ? null : getPerfumeById(id),
    getBrands(),
    getFamilies(),
    getNotes(),
    getAccords(),
  ]);
  if (!isNew && !perfume) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/perfumes" className="text-xs text-muted hover:text-forest">← Perfumes</Link>
      <h1 className="mt-3 mb-10 text-5xl">{isNew ? "Añadir perfume" : `Editar ${perfume!.name}`}</h1>
      {brands.length === 0 ? (
        <p className="text-sm text-muted">
          Primero creá al menos una marca en <Link href="/admin/catalogo" className="underline">Catálogo</Link>.
        </p>
      ) : (
        <PerfumeForm perfume={perfume} brands={brands} families={families} noteNames={notes.map((n) => n.name)} accordNames={accords.map((a) => a.name)} />
      )}
    </div>
  );
}
