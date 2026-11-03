import "server-only";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null };

export type SessionResult =
  | { status: "authenticated"; user: CurrentUser }
  | { status: "anonymous" }
  | { status: "unavailable" };

// Valida el JWT de la sesión (localmente con claves asimétricas, o contra
// Supabase Auth si no) en cada uso: el proxy no es la única barrera.
export async function readSession(): Promise<SessionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (isAuthRetryableFetchError(error)) {
    return { status: "unavailable" };
  }
  const claims = data?.claims;
  if (!claims?.sub) {
    return { status: "anonymous" };
  }
  return {
    status: "authenticated",
    user: {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
    },
  };
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await readSession();
  if (session.status === "unavailable") {
    throw new Error("Supabase Auth no está disponible.");
  }
  if (session.status === "anonymous") {
    redirect(LOGIN_PATH);
  }
  return session.user;
}
