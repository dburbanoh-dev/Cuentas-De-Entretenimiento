import { readSession } from "@/lib/auth/session";

// Ejemplo de endpoint privado: responde 401 sin sesión válida.
export async function GET() {
  const session = await readSession();

  if (session.status === "unavailable") {
    return Response.json(
      { error: "Servicio no disponible" },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }
  if (session.status === "anonymous") {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }
  return Response.json(session.user, {
    headers: { "Cache-Control": "no-store" },
  });
}
