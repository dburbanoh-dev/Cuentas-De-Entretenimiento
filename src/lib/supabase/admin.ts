import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";

// Cliente con privilegios de administrador: ignora RLS. Solo para código de servidor.
export function createAdminClient() {
  const { supabaseUrl } = getPublicEnv();
  return createClient(supabaseUrl, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
