"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { savePerfume } from "@/app/actions/admin";
import { CONCENTRATIONS, GENDERS } from "@/lib/constants";
import type { Brand, Family, Perfume } from "@/lib/types";
import { TagInput } from "./AdminControls";

export function PerfumeForm({
  perfume,
  brands,
  families,
  noteNames,
  accordNames,
}: {
  perfume: Perfume | null;
  brands: Brand[];
  families: Family[];
  noteNames: string[];
  accordNames: string[];
}) {
  const [state, action, pending] = useActionState(savePerfume, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  const layer = (l: string) => perfume?.notes.filter((n) => n.layer === l).map((n) => n.note.name) ?? [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-10"
    >
      {perfume && <input type="hidden" name="id" value={perfume.id} />}

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre *" error={fe.name}>
          <input name="name" defaultValue={perfume?.name} className="input" required />
        </Field>
        <Field label="Slug (URL)" error={fe.slug} hint="Se genera a partir del nombre si lo dejás vacío.">
          <input name="slug" defaultValue={perfume?.slug} className="input" />
        </Field>
        <Field label="Marca *" error={fe.brand_id}>
          <select name="brand_id" defaultValue={perfume?.brand.id ?? ""} className="input" required>
            <option value="">Elegí una marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Familia olfativa">
          <select name="family_id" defaultValue={perfume?.family?.id ?? ""} className="input">
            <option value="">Sin información</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Concentración" error={fe.concentration}>
          <select name="concentration" defaultValue={perfume?.concentration ?? ""} className="input">
            <option value="">Sin información</option>
            {CONCENTRATIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Género comercial" error={fe.gender}>
          <select name="gender" defaultValue={perfume?.gender ?? ""} className="input">
            <option value="">Sin información</option>
            {Object.entries(GENDERS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Año de lanzamiento" error={fe.release_year} hint="Dejalo vacío si no está verificado.">
          <input name="release_year" type="number" defaultValue={perfume?.release_year ?? ""} className="input" />
        </Field>
      </section>

      <Field label="Descripción" hint="Texto original. Si no hay información verificada, dejalo vacío.">
        <textarea name="description" defaultValue={perfume?.description ?? ""} rows={4} className="input" />
      </Field>

      <section className="grid gap-5 rounded-2xl bg-ivory p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Imagen (JPG, PNG o WebP, máx. 5 MB)" error={fe.image}>
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          {perfume?.image_url && (
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="remove_image" className="accent-forest" /> Quitar imagen actual
            </label>
          )}
        </Field>
        <Field label="Fuente y licencia de la imagen" error={fe.image_credit} hint="Obligatorio al subir una imagen. Ej.: “Foto propia” o “Cedida por la marca”.">
          <input name="image_credit" defaultValue={perfume?.image_credit ?? ""} className="input" />
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl">Pirámide olfativa</h2>
        <TagInput name="notes_salida" label="Notas de salida" initial={layer("salida")} suggestions={noteNames} />
        <TagInput name="notes_corazon" label="Notas de corazón" initial={layer("corazon")} suggestions={noteNames} />
        <TagInput name="notes_fondo" label="Notas de fondo" initial={layer("fondo")} suggestions={noteNames} />
        <TagInput
          name="accords"
          label="Acordes principales"
          initial={perfume?.accords.map((a) => a.accord.name) ?? []}
          suggestions={accordNames}
          hint="En orden de dominancia: el primero es el más intenso. Las notas o acordes nuevos se crean automáticamente."
        />
      </section>

      {state && !state.ok && <p role="alert" className="rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">{state.error}</p>}
      <button className="btn btn-primary !px-8" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {perfume ? "Guardar cambios" : "Crear perfume"}
      </button>
    </form>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <p className="field-error">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </label>
  );
}
