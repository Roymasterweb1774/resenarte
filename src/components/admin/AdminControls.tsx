"use client";

import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useId, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/Toast";

/** Botón que ejecuta una server action (ya enlazada con .bind) con confirmación opcional. */
export function ActionButton({
  action,
  label,
  confirm,
  tone = "default",
  className,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirm?: string;
  tone?: "default" | "danger" | "primary";
  className?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const res = await action();
          if (res.ok) {
            toast(res.message ?? "Listo");
            router.refresh();
          } else toast(res.error, "error");
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-50",
        tone === "danger" && "border-danger/30 text-danger hover:bg-danger/5",
        tone === "primary" && "border-forest bg-forest text-white hover:bg-forest-dark",
        tone === "default" && "border-line hover:border-forest hover:text-forest",
        className,
      )}
    >
      {pending && <Loader2 className="size-3 animate-spin" />} {label}
    </button>
  );
}

/** Formulario simple conectado a una server action con aviso de resultado. */
export function ActionForm({
  action,
  children,
  submitLabel = "Guardar",
  className,
  resetOnSuccess = true,
}: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const toast = useToast();
  const [state, run, pending] = useActionState(action, null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? "Guardado");
      if (resetOnSuccess) setKey((k) => k + 1);
    } else toast(state.error, "error");
  }, [state, toast, resetOnSuccess]);

  return (
    <form
      key={key}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => run(fd));
      }}
      className={className}
    >
      {children}
      <button className="btn btn-primary !py-2.5" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
      </button>
    </form>
  );
}

/** Entrada de etiquetas ordenadas (notas, acordes) con sugerencias. */
export function TagInput({
  name,
  label,
  initial,
  suggestions,
  hint,
}: {
  name: string;
  label: string;
  initial: string[];
  suggestions: string[];
  hint?: string;
}) {
  const listId = useId();
  const [tags, setTags] = useState(initial);
  const [value, setValue] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !tags.some((t) => t.toLowerCase() === v.toLowerCase())) setTags((t) => [...t, v]);
    setValue("");
  };

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex flex-wrap items-center gap-2 rounded-[0.625rem] border border-line bg-white p-2 focus-within:border-forest">
        {tags.map((t, i) => (
          <span key={t} className="tag">
            <span className="text-[10px] text-forest/60">{i + 1}</span> {t}
            <button type="button" onClick={() => setTags((x) => x.filter((y) => y !== t))} aria-label={`Quitar ${t}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          list={listId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(value);
            } else if (e.key === "Backspace" && !value) setTags((t) => t.slice(0, -1));
          }}
          onBlur={() => value && add(value)}
          placeholder="Escribí y pulsá Enter"
          className="min-w-40 flex-1 px-2 py-1 text-sm focus:outline-none"
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
