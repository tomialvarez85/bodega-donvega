"use client";

import { useActionState } from "react";

import { login } from "./actions";

const inputClass =
  "h-10 w-full border border-input bg-card px-3 text-sm text-cream outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-cream">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-cream">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 bg-cream text-sm font-medium text-ink transition-colors hover:bg-cream/90 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
