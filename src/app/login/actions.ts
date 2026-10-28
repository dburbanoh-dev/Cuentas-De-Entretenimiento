"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/lib/auth/form-state";
import { AUTH_MESSAGES, toAuthMessage } from "@/lib/auth/messages";
import { HOME_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: AUTH_MESSAGES.invalidCredentials };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: toAuthMessage(error) };
  }

  redirect(HOME_PATH);
}
