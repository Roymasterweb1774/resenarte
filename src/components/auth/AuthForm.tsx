"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { signIn, signInWithGoogle, signUp } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export function AuthForm({ next = "/", initialMode = "login" }: { next?: string; initialMode?: "login" | "registro" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [loginState, loginAction, loginPending] = useActionState(signIn, null);
  const [signupState, signupAction, signupPending] = useActionState(signUp, null);

  const state = mode === "login" ? loginState : signupState;
  const pending = loginPending || signupPending;

  useEffect(() => {
    if ((loginState?.ok || (signupState?.ok && !signupState.message))) {
      router.push(next);
      router.refresh();
    }
  }, [loginState, signupState, next, router]);

  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div>
      <div className="relative mb-7 grid grid-cols-2 rounded-full bg-ivory p-1" role="tablist">
        {(["login", "registro"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("relative z-10 rounded-full py-2.5 text-sm transition-colors", mode === m ? "text-white" : "text-ink/70")}
          >
            {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 -z-10 rounded-full bg-forest" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button className="btn btn-outline w-full">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
          </svg>
          Continuar con Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> o con tu email <span className="h-px flex-1 bg-line" />
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          action={mode === "login" ? loginAction : signupAction}
          initial={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
          noValidate
        >
          <input type="hidden" name="next" value={next} />
          {mode === "registro" && (
            <Field name="name" label="Nombre público" autoComplete="nickname" error={fe.name} />
          )}
          <Field name="email" type="email" label="Email" autoComplete="email" error={fe.email} />
          <Field
            name="password"
            type="password"
            label="Contraseña"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            error={fe.password}
            hint={mode === "registro" ? "Mínimo 8 caracteres." : undefined}
          />

          {state && !state.ok && (
            <p role="alert" className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          {state?.ok && state.message && (
            <p role="status" className="rounded-lg bg-sage-light px-3 py-2 text-sm text-forest-dark">
              {state.message}
            </p>
          )}

          <button className="btn btn-primary w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Ingresar" : "Crear mi cuenta"}
          </button>
          {mode === "registro" && (
            <p className="text-center text-xs leading-relaxed text-muted">
              Al registrarte aceptás los términos de uso y la política de privacidad de Reseñarte.
            </p>
          )}
        </motion.form>
      </AnimatePresence>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  error,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} required className="input" aria-invalid={!!error} />
      {error ? <p className="field-error">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </label>
  );
}
