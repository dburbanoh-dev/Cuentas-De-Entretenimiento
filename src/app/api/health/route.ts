import { connection } from "next/server";
import { HEALTH_TIMEOUT_MS } from "@/lib/health";
import { getPublicClient } from "@/lib/supabase/public";

type HealthBody = {
  status: "ok" | "degraded";
  database: "ok" | "error";
  timestamp: string;
};

async function isDatabaseReachable(): Promise<boolean> {
  // El abort cancela la petición a Supabase, no solo la espera.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const { data, error } = await getPublicClient()
      .rpc("health_check")
      .abortSignal(controller.signal);
    return !error && data === 1;
  } catch {
    // El detalle del error nunca se expone en la respuesta.
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  // Fuerza la ejecución en cada petición: el estado no se prerenderiza.
  await connection();

  const databaseOk = await isDatabaseReachable();
  const body: HealthBody = {
    status: databaseOk ? "ok" : "degraded",
    database: databaseOk ? "ok" : "error",
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, {
    status: databaseOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
