"use server";

import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/env";
import type { AuthFormState } from "@/lib/auth/form-state";
import {
  AUTH_MESSAGES,
  parseCredentials,
  toAuthMessage,
} from "@/lib/auth/messages";
import { HOME_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.ok) {
    return { error: parsed.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.value,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/confirm` },
  });
  if (error) {
    return { error: toAuthMessage(error) };
  }

  // Con la confirmación de email activa, Supabase responde sin error para un
  // email ya registrado pero sin identidades: no se crea una cuenta nueva.
  if (data.user && data.user.identities?.length === 0) {
    return { error: AUTH_MESSAGES.signupFailed };
  }

  if (data.session) {
    redirect(HOME_PATH);
  }
  return {
    notice: "Te enviamos un email para confirmar tu cuenta.",
  };
}
