import { deleteSimple, saveBrand, saveSimple } from "@/app/actions/admin";
import { ActionButton, ActionForm } from "@/components/admin/AdminControls";
import { getAccords, getBrands, getFamilies, getNotes } from "@/lib/data";

export default async function AdminCatalog() {
  const [brands, families, notes, accords] = await Promise.all([getBrands(), getFamilies(), getNotes(), getAccords()]);

  return (
    <div className="space-y-16">
      <h1 className="text-5xl">Catálogo</h1>

      {/* Marcas */}
      <section>
        <h2 className="mb-6 text-3xl">Marcas</h2>
        <ActionForm action={saveBrand} submitLabel="Añadir marca" className="grid gap-4 rounded-2xl bg-ivory p-5 sm:grid-cols-2">
          <input name="name" placeholder="Nombre *" className="input" required />
          <input name="country" placeholder="País (opcional)" className="input" />
          <textarea name="description" placeholder="Descripción original (dejar vacío si no hay información verificada)" rows={2} className="input sm:col-span-2" />
          <input name="logo_url" placeholder="URL del logotipo (solo con permiso de uso)" className="input" />
          <input name="logo_credit" placeholder="Fuente / permiso del logotipo" className="input" />
        </ActionForm>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {brands.map((b) => (
            <li key={b.id}>
              <details className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-serif text-xl">{b.name}</span>
                  <span className="text-xs text-muted">{b.perfume_count} perfumes · <span className="text-forest group-open:hidden">editar</span></span>
                </summary>
                <div className="mt-4 space-y-4">
                  <ActionForm action={saveBrand} submitLabel="Guardar marca" resetOnSuccess={false} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={b.id} />
                    <input name="name" defaultValue={b.name} className="input" required />
                    <input name="slug" defaultValue={b.slug} className="input" />
                    <input name="country" defaultValue={b.country ?? ""} placeholder="País" className="input" />
                    <input name="logo_url" defaultValue={b.logo_url ?? ""} placeholder="URL del logotipo" className="input" />
                    <textarea name="description" defaultValue={b.description ?? ""} rows={3} className="input sm:col-span-2" />
                    <input name="logo_credit" defaultValue={b.logo_credit ?? ""} placeholder="Fuente / permiso del logotipo" className="input sm:col-span-2" />
                  </ActionForm>
                  <ActionButton action={deleteSimple.bind(null, "brands", b.id)} label="Eliminar marca" tone="danger" confirm={`¿Eliminar ${b.name}? Solo es posible si no tiene perfumes.`} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* Familias, notas y acordes */}
      {(
        [
          { table: "families", title: "Familias olfativas", items: families },
          { table: "notes", title: "Notas", items: notes },
          { table: "accords", title: "Acordes", items: accords },
        ] as const
      ).map(({ table, title, items }) => (
        <section key={table}>
          <h2 className="mb-6 text-3xl">{title}</h2>
          <ActionForm action={saveSimple} submitLabel="Añadir" className="flex flex-wrap items-center gap-3 rounded-2xl bg-ivory p-5">
            <input type="hidden" name="table" value={table} />
            <input name="name" placeholder="Nombre *" className="input max-w-xs" required />
            {table === "families" && <input name="description" placeholder="Descripción" className="input max-w-md" />}
            {table === "accords" && (
              <label className="flex items-center gap-2 text-sm">
                Color <input type="color" name="color" defaultValue="#8A9B7A" className="h-10 w-14 rounded border border-line" />
              </label>
            )}
          </ActionForm>
          <ul className="mt-5 flex flex-wrap gap-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-1 rounded-full border border-line py-1 pr-1 pl-3 text-sm">
                {"color" in it && it.color && <span className="mr-1 size-2.5 rounded-full" style={{ backgroundColor: it.color }} />}
                {it.name}
                <ActionButton action={deleteSimple.bind(null, table, it.id)} label="×" tone="danger" className="!rounded-full !border-0 !px-2 !py-0.5" confirm={`¿Eliminar “${it.name}”?`} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
