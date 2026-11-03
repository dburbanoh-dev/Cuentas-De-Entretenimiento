import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

let publicClient: SupabaseClient | undefined;

// Cliente anónimo sin sesión, para endpoints públicos del servidor. No guarda
// estado por usuario, así que se reutiliza entre peticiones.
export function getPublicClient(): SupabaseClient {
  if (!publicClient) {
    const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
    publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}
