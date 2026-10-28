"use client";

import { useActionState } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/messages";
import {
  initialAuthFormState,
  type AuthFormState,
} from "@/lib/auth/form-state";

type AuthFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
};

export function AuthForm({
  action,
  submitLabel,
  passwordAutoComplete,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          minLength={
            passwordAutoComplete === "new-password"
              ? MIN_PASSWORD_LENGTH
              : undefined
          }
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <p aria-live="polite" className="min-h-5 text-sm">
        {state.error ? (
          <span className="text-red-600">{state.error}</span>
        ) : (
          <span className="text-emerald-700">{state.notice}</span>
        )}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
      >
        {pending ? "Enviando…" : submitLabel}
      </button>
    </form>
  );
}
