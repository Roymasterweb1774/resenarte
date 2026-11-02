"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useEffect } from "react";
import { deleteAccount, updateProfile } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { useToast } from "../ui/Toast";

export function ProfileForm({ profile }: { profile: Profile }) {
  const toast = useToast();
  const [state, action, pending] = useActionState(updateProfile, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  useEffect(() => {
    if (state?.ok) toast(state.message ?? "Guardado");
  }, [state, toast]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-6"
    >
      <div className="flex items-center gap-5">
        <Avatar name={profile.display_name} src={profile.avatar_url} size={72} />
        <label className="text-sm">
          <span className="label">Avatar</span>
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="text-xs file:mr-3 file:rounded-lg file:border file:border-line file:bg-white file:px-3 file:py-1.5" />
          {fe.avatar && <p className="field-error">{fe.avatar}</p>}
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="label">Nombre público</span>
          <input name="display_name" defaultValue={profile.display_name} className="input" aria-invalid={!!fe.display_name} />
          {fe.display_name && <p className="field-error">{fe.display_name}</p>}
        </label>
        <label>
          <span className="label">Nombre de usuario</span>
          <input name="username" defaultValue={profile.username} className="input" aria-invalid={!!fe.username} />
          {fe.username && <p className="field-error">{fe.username}</p>}
        </label>
      </div>
      <label className="block">
        <span className="label">Biografía breve</span>
        <textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={300} rows={3} className="input" placeholder="Amante de los amaderados, coleccionista de decants..." />
        {fe.bio && <p className="field-error">{fe.bio}</p>}
      </label>

      <fieldset className="rounded-2xl bg-ivory p-5">
        <legend className="sr-only">Privacidad</legend>
        <p className="mb-3 font-serif text-xl">Privacidad del perfil</p>
        <label className="flex items-center gap-3 py-1.5 text-sm">
          <input type="checkbox" name="show_favorites" defaultChecked={profile.show_favorites} className="size-4 accent-forest" />
          Mostrar mis favoritos en mi perfil público
        </label>
        <label className="flex items-center gap-3 py-1.5 text-sm">
          <input type="checkbox" name="show_collection" defaultChecked={profile.show_collection} className="size-4 accent-forest" />
          Mostrar mi colección en mi perfil público
        </label>
        <p className="mt-2 text-xs text-muted">Tus reseñas publicadas siempre son públicas.</p>
      </fieldset>

      {state && !state.ok && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Guardar cambios
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, null);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted">
        Se eliminarán tu cuenta, tus reseñas, votos, favoritos y colección. Esta acción no se puede deshacer. Escribí <strong>ELIMINAR</strong> para confirmar.
      </p>
      <input name="confirm" className="input max-w-xs" autoComplete="off" aria-label="Escribí ELIMINAR para confirmar" />
      {state && !state.ok && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button className="btn bg-danger text-white hover:bg-danger/90" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Eliminar mi cuenta
      </button>
    </form>
  );
}
