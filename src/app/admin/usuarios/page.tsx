import Link from "next/link";
import { updateUser } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/AdminControls";
import { Avatar } from "@/components/ui/Avatar";
import { getCurrentUser, getUsersForAdmin } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ROLES = { user: "Usuario", moderator: "Moderación", admin: "Admin" } as const;

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [users, me] = await Promise.all([getUsersForAdmin(q), getCurrentUser()]);

  return (
    <div>
      <h1 className="text-5xl">Usuarios</h1>
      <form className="mt-6 flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por usuario o nombre" className="input" />
        <button className="btn btn-outline">Buscar</button>
      </form>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 py-4">
            <Avatar name={u.display_name} src={u.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <Link href={`/perfil/${u.username}`} className="font-medium hover:text-forest">{u.display_name}</Link>
              <p className="text-xs text-muted">
                @{u.username} · desde {formatDate(u.created_at)} · {ROLES[u.role]}
                {u.is_banned && <span className="ml-2 text-danger">Suspendido</span>}
              </p>
            </div>
            {u.id !== me?.id && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ROLES) as (keyof typeof ROLES)[])
                  .filter((r) => r !== u.role)
                  .map((r) => (
                    <ActionButton key={r} action={updateUser.bind(null, u.id, { role: r })} label={`Hacer ${ROLES[r].toLowerCase()}`} confirm={`¿Cambiar el rol de @${u.username} a ${ROLES[r]}?`} />
                  ))}
                <ActionButton
                  action={updateUser.bind(null, u.id, { is_banned: !u.is_banned })}
                  label={u.is_banned ? "Reactivar" : "Suspender"}
                  tone={u.is_banned ? "default" : "danger"}
                  confirm={u.is_banned ? undefined : `¿Suspender a @${u.username}? No podrá publicar ni votar.`}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
